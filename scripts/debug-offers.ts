import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing Supabase configuration in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkOffers() {
    console.log('🔍 Checking offers table...');
    const { data, error, count } = await supabase
        .from('offers')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('❌ Error fetching offers:', error.message);
        return;
    }

    console.log(`✅ Found ${count} offers in the database.`);
    if (data && data.length > 0) {
        console.table(data);
    } else {
        console.log('⚠️ The table is empty.');
    }
}

checkOffers();
