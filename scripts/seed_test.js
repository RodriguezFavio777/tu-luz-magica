require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seedTest() {
    console.log('🌱 Seeding Test Product with Variants...');

    const payload = {
        name: 'Vela 7 Colores (Test)',
        description: 'Producto de prueba para verificar selector de variantes.',
        price: 1500,
        is_active: true,
        type: 'physical',
        stock: 100,
        images: [
            'https://santerialacatedral.com.ar/img/c/193.jpg',
            'https://santerialacatedral.com.ar/img/c/194.jpg'
        ],
        variants: [
            { name: 'Rojo Check', type: 'Color' },
            { name: 'Azul Check', type: 'Color' },
            { name: 'Amarillo Check', type: 'Color' }
        ]
    };

    // Robust Check-then-Upsert
    const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('name', payload.name)
        .maybeSingle();

    let result;
    if (existing) {
        console.log('Product exists, updating...');
        result = await supabase.from('products').update(payload).eq('id', existing.id).select().single();
    } else {
        console.log('Creating new product...');
        result = await supabase.from('products').insert(payload).select().single();
    }

    if (result.error) {
        console.error('Error seeding:', result.error);
    } else {
        console.log('✅ Created/Updated Product:', result.data.name);
        console.log('🆔 ID:', result.data.id);
        console.log('Go to: http://localhost:3000/productos/' + result.data.id);
    }
}

seedTest();
