require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkData() {
    console.log('🔍 Checking Products Data...');

    // Check Products
    const { data: products, error: prodError } = await supabase
        .from('products')
        .select('name, images, image_url, category_id')
        .not('images', 'is', null)
        .limit(5);

    if (prodError) console.error('Product Error:', prodError);
    else {
        console.log('--- PRODUCTS SAMPLE ---');
        console.log(JSON.stringify(products, null, 2));
    }

    // Check Categories for "Oraculos", "Tarot", "Pañuelos"
    const { data: cats, error: catError } = await supabase
        .from('service_categories')
        .select('*')
        .ilike('name', '%tarot%')
        .or('name.ilike.%oraculo%,name.ilike.%pañuelo%');

    if (catError) console.error('Cat Error:', catError);
    else {
        console.log('--- CATEGORIES CHECK ---');
        console.log(cats);
    }
}

checkData();
