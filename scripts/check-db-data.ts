
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkData() {
    console.log('--- Checking Categories ---');
    const { data: categories, error: catError } = await supabase.from('service_categories').select('*');
    if (catError) console.error(catError);
    else console.table(categories);

    console.log('\n--- Checking Services (Products) ---');
    const { data: services, error: servError } = await supabase.from('products').select('id, name, category_id, type');
    if (servError) console.error(servError);
    else console.table(services);
}

checkData();
