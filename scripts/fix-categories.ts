
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables manually
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function syncCategories() {
    console.log('🔄 Syncing Categories...');

    // 1. Define correct categories
    // ... (rest of categories definition)
    const categories = [
        { name: 'Rituales', slug: 'rituales', icon: 'Sparkles', is_active: true, display_order: 1, scope: 'service' },
        { name: 'Lecturas de Tarot', slug: 'lecturas', icon: 'BookOpen', is_active: true, display_order: 2, scope: 'service' },
        { name: 'Limpiezas', slug: 'limpiezas', icon: 'Wind', is_active: true, display_order: 3, scope: 'service' }
    ];

    const catMap: Record<string, string> = {};

    // 2. Fetch OR Create categories
    for (const cat of categories) {
        // Try to fetch existing category by slug first
        let { data: existing } = await supabase
            .from('service_categories')
            .select('id')
            .eq('slug', cat.slug)
            .single();

        if (!existing) {
            console.log(`Creating category: ${cat.name}`);
            const { data: newCat, error } = await supabase
                .from('service_categories')
                .insert(cat)
                .select('id')
                .single();

            if (error) {
                console.error(`Error creating category ${cat.name}:`, error.message);
                continue;
            }
            existing = newCat;
        }

        if (existing) {
            catMap[cat.slug] = existing.id;
            console.log(`✅ Category ID for ${cat.slug}: ${existing.id}`);
        }
    }

    // 3. Map Services to Category IDs
    const serviceCategoryMap = {
        'rituales': [
            'Ritual de Endulzamiento y Unión',
            'Ritual de Amor Propio y Magnetismo'
        ],
        'limpiezas': [
            'Limpieza Energética y Corte de Daños'
        ],
        'lecturas': [
            'Lectura de Vínculo Amoroso / Ex',
            'Lectura General',
            'Lectura Astrológica Anual',
            'Preguntas Específicas'
        ]
    };

    console.log('🔗 Linking Services to Categories...');

    for (const [slug, serviceNames] of Object.entries(serviceCategoryMap)) {
        const categoryId = catMap[slug];
        if (!categoryId) {
            console.warn(`⚠️ Skipping services for missing category slug: ${slug}`);
            continue;
        }

        for (const name of serviceNames) {
            const { error } = await supabase
                .from('products')
                .update({ category_id: categoryId, type: 'service' })
                .eq('name', name);

            if (error) {
                console.error(`❌ Error linking ${name}:`, error.message);
            } else {
                console.log(`✅ Linked ${name} -> ${slug}`);
            }
        }
    }

    console.log('✨ Synchronization Complete!');
}

syncCategories();
