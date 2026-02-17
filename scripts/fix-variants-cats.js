require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    console.log('🧹 Limpieza de Variantes y Categorías...');

    // 1. Obtener Mapa de Categorías
    const { data: cats, error: catError } = await supabase
        .from('service_categories')
        .select('id, slug, name')
        .eq('scope', 'physical');

    if (catError) { console.error('Error fetching cats:', catError); return; }

    const catMap = new Map();
    cats.forEach(c => catMap.set(c.slug, c.id));
    console.log('✅ Categorías cargadas:', Array.from(catMap.keys()));

    // 2. Obtener Todos los Productos
    const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id, name, variants, category_id');

    if (prodError) { console.error('Error fetching products:', prodError); return; }

    console.log(`📦 Procesando ${products.length} productos...`);

    let updatedCount = 0;

    for (const p of products) {
        let needsUpdate = false;
        let updates = {};

        // --- A. Limpieza de Variantes ---
        let newVariants = p.variants;
        if (Array.isArray(newVariants) && newVariants.length > 0) {
            // Si contiene opciones basura como "Todas las categorías" o urls
            const badKeywords = ['todas las categorías', 'velas de noche', 'velas largas', 'velas santoral', 'http', 'www', 'inicio', 'servicios', 'tienda'];

            // Comprobamos si alguna opción contiene basura
            const hasBadOptions = newVariants.some(v =>
                v.options && v.options.some(opt =>
                    badKeywords.some(bk => opt.toLowerCase().includes(bk))
                )
            );

            // Heurística de longitud excesiva (>15 opciones suele ser sospechoso si no es color/talle)
            // O si contiene saltos de línea raros
            if (hasBadOptions) {
                console.log(`🗑️ Eliminando variantes basura de: ${p.name}`);
                newVariants = []; // Reset a vacío
                updates.variants = [];
                needsUpdate = true;
            }
        }

        // --- B. Corrección de Categoría ---
        const lowerName = p.name.toLowerCase();
        let correctSlug = null;

        if (lowerName.includes('vela')) correctSlug = 'velas';
        else if (lowerName.includes('sauhmerio') || lowerName.includes('sahumerio') || lowerName.includes('incienso') || lowerName.includes('carbon') || lowerName.includes('cono') || lowerName.includes('cascada')) correctSlug = 'sahumerios';
        else if (lowerName.includes('tarot') || lowerName.includes('oraculo') || lowerName.includes('carta')) correctSlug = 'oraculos';
        else if (lowerName.includes('runa') || lowerName.includes('pendulo')) correctSlug = 'lectura-runas';
        else if (lowerName.includes('buda') || lowerName.includes('elefante') || lowerName.includes('imagen') || lowerName.includes('santo') || lowerName.includes('figura') || lowerName.includes('duende') || lowerName.includes('gnomo') || lowerName.includes('muñeco')) correctSlug = 'varios';
        else if (lowerName.includes('aceite') || lowerName.includes('esencia') || lowerName.includes('difusor')) correctSlug = 'aromaterapia';
        else if (lowerName.includes('piedra') || lowerName.includes('cristal') || lowerName.includes('cuarzo')) correctSlug = 'cristales';

        // Si encontramos una categoría mejor y es distinta a la actual
        if (correctSlug && catMap.has(correctSlug)) {
            const newCatId = catMap.get(correctSlug);
            if (p.category_id !== newCatId) {
                console.log(`🏷️ Categoría corregida: ${p.name} -> ${correctSlug}`);
                updates.category_id = newCatId;
                needsUpdate = true;
            }
        } else if (!p.category_id && catMap.has('varios')) {
            // Default a 'Varios' si no tiene
            updates.category_id = catMap.get('varios');
            needsUpdate = true;
        }

        // --- C. Guardar Cambios ---
        if (needsUpdate) {
            const { error: updateError } = await supabase
                .from('products')
                .update(updates)
                .eq('id', p.id);

            if (updateError) console.error(`❌ Error actualizando ${p.name}:`, updateError.message);
            else updatedCount++;
        }
    }

    console.log(`🎉 Finalizado. ${updatedCount} productos corregidos.`);
}

main();
