require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkVariants() {
    const { data, error } = await supabase
        .from('products')
        .select('name, variants')
        .neq('variants', '[]') // Only show products with variants
        .limit(10);

    if (error) {
        console.error(error);
        return;
    }

    if (data.length === 0) {
        console.log('No products with variants found (yet).');
    } else {
        console.log('Found variants:');
        console.log(JSON.stringify(data, null, 2));
    }
}

checkVariants();
