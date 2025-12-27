
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { getLocalizedText } from './localization';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSearch() {
    console.log('--- Debugging Search Data (Round 3) ---');

    // Fetch all hotels
    const { data: hotels, error } = await supabase
        .from('hotels')
        .select('id, name, location')
        .is('deleted_at', null);

    if (error) {
        console.error('Error fetching hotels:', error);
        return;
    }

    const query = "bodrum";
    console.log(`Testing search for query: "${query}"`);

    // Mocking the logic from SearchClient.tsx
    // We need to replicate getLocalizedText logic roughly or import it if possible.
    // I added import above, but I need to make sure I can run it with tsx.
    // If import fails (due to module resolution), I'll mock it.

    const mockGetLocalizedText = (text: any) => {
        if (typeof text === 'string') {
            try {
                const parsed = JSON.parse(text);
                return parsed.tr || parsed;
            } catch {
                return text;
            }
        }
        return text?.tr || text;
    }

    const matches = hotels!.filter(hotel => {
        const loc = mockGetLocalizedText(hotel.location).toLowerCase();
        const match = loc.includes(query);
        if (match) {
            // console.log(`Matched: ${loc}`);
        }
        return match;
    });

    console.log(`Found ${matches.length} matches for 'bodrum'.`);
    if (matches.length > 0) {
        console.log('Sample match:', matches[0].name);
    } else {
        console.log('Logic failed for Bodrum even though data appeared to exist in previous logs.');
    }

}

debugSearch();
