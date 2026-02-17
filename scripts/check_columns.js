const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    console.log('Checking columns on "products"...');
    // Try to select the columns. If they don't exist, it will error.
    const { data, error } = await supabase.from('products').select('id, name, images, variants').limit(1);

    if (error) {
        console.error('Column Check Error:', error);
    } else {
        console.log('Columns EXIST. Data sample:', data);
    }

    // Also check for Unique Constraint on 'name'
    // We can't easily check constraints via JS client without RPC, 
    // but we can try to Insert duplicate.
    const testName = "TEST_UNIQUE_CHK_" + Date.now();
    const { error: insErr } = await supabase.from('products').insert({
        name: testName,
        price: 100,
        type: 'physical'
    });
    if (insErr) console.log('Insert 1 Error:', insErr);

    const { error: insErr2 } = await supabase.from('products').insert({
        name: testName,
        price: 200,
        type: 'physical'
    });

    if (insErr2 && insErr2.code === '23505') {
        console.log('Constraint CHECK: Name IS Unique (Good).');
    } else {
        console.log('Constraint CHECK: Name is NOT Unique (BAD). Error:', insErr2);
    }
}

check();
