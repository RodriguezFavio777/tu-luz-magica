
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables manually
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function seedServices() {
    console.log('🌱 Seeding Services...');

    // 1. Ensure Categories Exist
    const categories = [
        { name: 'Rituales', slug: 'rituales', icon: 'Sparkles', color: 'from-purple-500 to-pink-500', is_active: true, display_order: 1, scope: 'service' },
        { name: 'Lecturas de Tarot', slug: 'lecturas', icon: 'BookOpen', color: 'from-indigo-500 to-blue-500', is_active: true, display_order: 2, scope: 'service' },
        { name: 'Limpiezas', slug: 'limpiezas', icon: 'Wind', color: 'from-green-500 to-teal-500', is_active: true, display_order: 3, scope: 'service' }
    ];

    for (const cat of categories) {
        const { error } = await supabase
            .from('service_categories')
            .upsert(cat, { onConflict: 'slug' });

        if (error) console.error(`Error Upserting Category ${cat.name}:`, error.message);
    }

    // Fetch Category IDs
    const { data: categoryRows } = await supabase.from('service_categories').select('*');
    const catMap = Object.fromEntries(categoryRows?.map(c => [c.slug, c.id]) || []);

    const services = [
        // RITUALES
        {
            name: 'Ritual de Endulzamiento y Unión',
            description: 'Trabajo ritual enfocado en armonizar el vínculo, suavizar energías densas y fortalecer la conexión emocional y sexual. Incluye limpieza energética profunda, endulzamiento y protección espiritual.',
            price: 300000,
            type: 'service',
            category_id: catMap['rituales'],
            image_url: '/services/ritual_endulzamiento.jpg',
            is_active: true
        },
        {
            name: 'Ritual de Amor Propio y Magnetismo',
            description: 'Rituales enfocados en fortalecer tu energía personal, elevar la autoestima, activar el magnetismo natural y abrir caminos. Incluye activación energética y protección espiritual.',
            price: 250000,
            type: 'service',
            category_id: catMap['rituales'],
            image_url: '/services/ritual_amor_propio.jpg',
            is_active: true
        },

        // LIMPIEZAS
        {
            name: 'Limpieza Energética y Corte de Daños',
            description: 'Ritual profundo para eliminar bloqueos, cargas pesadas, envidia o trabajos energéticos negativos. Ideal para destrabar situaciones que se repiten.',
            price: 200000,
            type: 'service',
            category_id: catMap['limpiezas'],
            image_url: '/services/limpieza_energetica.jpg',
            is_active: true
        },

        // LECTURAS
        {
            name: 'Lectura de Vínculo Amoroso / Ex',
            description: 'Análisis profundo de la situación actual, conflictos, sentimientos ocultos y futuro del vínculo. Incluye presencia de trabajos energéticos y consejo del oráculo. +1 Pregunta específica.',
            price: 150000,
            type: 'service',
            category_id: catMap['lecturas'],
            image_url: '/services/lectura_vinculo.jpg',
            is_active: true
        },
        {
            name: 'Lectura General',
            description: 'Panorama completo de Amor, Trabajo y Salud. Incluye 5 preguntas concretas, consejo de arcanos y limpieza energética corta durante la sesión.',
            price: 200000,
            type: 'service',
            category_id: catMap['lecturas'],
            image_url: '/services/lectura_general.jpg',
            is_active: true
        },
        {
            name: 'Lectura Astrológica Anual',
            description: 'Proyección energética para tu año solar. Claves para aprovechar los tránsitos planetarios a tu favor.',
            price: 120000,
            type: 'service',
            category_id: catMap['lecturas'],
            image_url: '/services/carta_astral.jpg',
            is_active: true
        },
        {
            name: 'Preguntas Específicas',
            description: 'Respuestas concretas y directas del oráculo para dudas puntuales. Ideal para tomar decisiones rápidas.',
            price: 60000,
            type: 'service',
            category_id: catMap['lecturas'],
            image_url: '/services/preguntas_tarot.jpg',
            is_active: true
        }
    ];

    for (const s of services) {
        const { error } = await supabase
            .from('products') // Assuming 'products' table holds services too based on 'type' column
            .upsert(s, { onConflict: 'name' });

        if (error) {
            console.error(`❌ Error Upserting Service ${s.name}:`, error.message);
        } else {
            console.log(`✅ Upserted ${s.name}`);
        }
    }

    console.log('✨ Service Seeding Completed!');
}

seedServices();
