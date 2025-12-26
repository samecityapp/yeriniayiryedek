import { getSearchableLocations } from './constants/regions';

console.log('🔍 Verifying Kapadokya location data...');

const locations = getSearchableLocations();
const hasKapadokya = locations.includes('Kapadokya');
const expectedItems = [
    'Kapadokya',
    'Göreme, Kapadokya',
    'Uçhisar, Kapadokya',
    'Ürgüp, Kapadokya',
    'Avanos, Kapadokya',
    'Ortahisar, Kapadokya'
];

const missingItems = expectedItems.filter(item => !locations.includes(item));

if (hasKapadokya && missingItems.length === 0) {
    console.log('✅ SUCCESS: Kapadokya and all districts are present in the location list.');
    console.log('------------------------------------------------');
    console.log('Newly added items found:');
    expectedItems.forEach(item => console.log(` - ${item}`));
    console.log('------------------------------------------------');
} else {
    console.error('❌ FAILURE: Some items are missing.');
    if (!hasKapadokya) console.error('CRITICAL: "Kapadokya" main city entry is missing.');
    if (missingItems.length > 0) {
        console.error('Missing specific items:');
        missingItems.forEach(item => console.error(` - ${item}`));
    }
    process.exit(1);
}
