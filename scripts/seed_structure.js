require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seedStructure() {
    console.log('🌱 Seeding Critical Data Structure...');

    // 1. Ensure Categories
    const categories = [
        // Services
        { name: 'Tarot y Oráculos', slug: 'tarot', parent: null, type: 'service' },
        { name: 'Rituales', slug: 'rituales', parent: null, type: 'service' },
        { name: 'Limpiezas Energéticas', slug: 'limpiezas', parent: null, type: 'service' },
        // Products
        { name: 'Velas y Ritual', slug: 'velas', parent: null, type: 'physical' },
        { name: 'Cristales y Joyas', slug: 'cristales', parent: null, type: 'physical' },
        { name: 'Aromaterapia', slug: 'aromas', parent: null, type: 'physical' },
    ];

    const catMap = {};

    for (const c of categories) {
        // Upsert Category
        const { data, error } = await supabase
            .from('service_categories')
            .upsert({
                name: c.name,
                slug: c.slug,
                description: 'Categoría Principal',
                is_active: true
            }, { onConflict: 'slug' })
            .select('id, slug')
            .single();

        if (data) catMap[c.slug] = data.id;
        else console.error(`Error on cat ${c.slug}:`, error);
    }

    console.log('✅ Categories Verified.');

    // 2. Insert Dummy Services (for /servicios)
    const services = [
        {
            name: 'Lectura de Tarot Evolutivo',
            description: 'Sesión de 60 minutos para explorar tu presente y futuro. Incluye tirada general y preguntas específicas.',
            price: 15000,
            image_url: 'https://placehold.co/600x800/1a1a1a/f472b6?text=Tarot+Evolutivo',
            category_slug: 'tarot',
            type: 'service'
        },
        {
            name: 'Limpieza Energética de Hogar',
            description: 'Purificación completa de ambientes. Usamos sahumerios y técnicas ancestrales para elevar la vibración.',
            price: 25000,
            image_url: 'https://placehold.co/600x800/1a1a1a/D4AF37?text=Limpieza+Hogar',
            category_slug: 'limpiezas',
            type: 'service'
        },
        {
            name: 'Ritual Abrecaminos',
            description: 'Ritual personalizado para desbloquear situaciones estancadas en trabajo o amor.',
            price: 18000,
            image_url: 'https://placehold.co/600x800/1a1a1a/ec4899?text=Abrecaminos',
            category_slug: 'rituales',
            type: 'service'
        }
    ];

    for (const s of services) {
        await supabase.from('products').upsert({
            name: s.name,
            description: s.description,
            price: s.price,
            image_url: s.image_url,
            category_id: catMap[s.category_slug],
            type: s.type,
            is_active: true,
            stock: 999
        }, { onConflict: 'name' });
    }
    console.log('✅ Services Seeded.');

    // 3. Insert Dummy Products (for /productos and Filters)
    const products = [
        {
            name: 'Vela 7 Colores',
            description: 'Vela ritual para equilibrar los 7 chakras.',
            price: 3500,
            image_url: 'https://placehold.co/600x800/1a1a1a/f472b6?text=Vela+7+Colores',
            category_slug: 'velas',
            variants: [{ name: 'Grande', type: 'Size' }, { name: 'Chica', type: 'Size' }]
        },
        {
            name: 'Amatista en Bruto',
            description: 'Cristal natural para transmutar energías.',
            price: 5000,
            image_url: 'https://placehold.co/600x800/1a1a1a/9b59b6?text=Amatista',
            category_slug: 'cristales',
            variants: []
        },
        {
            name: 'Sahumerio Sagrada Madre',
            description: 'Caja x 12 unidades. Aroma Lavanda.',
            price: 2500,
            image_url: 'https://placehold.co/600x800/1a1a1a/e67e22?text=Sahumerio',
            category_slug: 'aromas',
            variants: []
        }
    ];

    for (const p of products) {
        await supabase.from('products').upsert({
            name: p.name,
            description: p.description,
            price: p.price,
            image_url: p.image_url,
            category_id: catMap[p.category_slug],
            type: 'physical',
            is_active: true,
            stock: 50,
            variants: p.variants
        }, { onConflict: 'name' });
    }
    console.log('✅ Products Seeded.');
}

seedStructure();
