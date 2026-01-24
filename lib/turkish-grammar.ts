/**
 * Turkish Grammar Utility
 * Handles automatic suffix generation based on Vowel Harmony and Consonant Assimilation.
 */

const HARD_CONSONANTS = ['f', 's', 't', 'k', 'ç', 'ş', 'h', 'p'];
const BACK_VOWELS = ['a', 'ı', 'o', 'u'];
const FRONT_VOWELS = ['e', 'i', 'ö', 'ü'];

function getLastVowel(word: string): string | undefined {
    const vowels = [...BACK_VOWELS, ...FRONT_VOWELS];
    for (let i = word.length - 1; i >= 0; i--) {
        if (vowels.includes(word[i].toLowerCase())) {
            return word[i].toLowerCase();
        }
    }
    return undefined;
}

function getLastChar(word: string): string {
    return word.trim().slice(-1).toLowerCase();
}

/**
 * Returns the proper suffix for "in/at" (Locative: -da, -de, -ta, -te)
 * with an apostrophe if needed for proper nouns (assumed true for regions).
 */
export function getLocativeSuffix(word: string, apostrophe = true): string {
    if (!word) return '';

    const lastChar = getLastChar(word);
    const lastVowel = getLastVowel(word);

    // 1. Consonant Assimilation (d/t)
    const isHard = HARD_CONSONANTS.includes(lastChar);
    const firstLetter = isHard ? 't' : 'd';

    // 2. Vowel Harmony (a/e)
    // If no vowel found (rare in valid text), default to 'a' (back)
    const isBack = lastVowel ? BACK_VOWELS.includes(lastVowel) : true;
    const vowel = isBack ? 'a' : 'e';

    const suffix = `${firstLetter}${vowel}`;
    return apostrophe ? `’${suffix}` : suffix;
}

/**
 * Returns the proper suffix for "from" (Ablative: -dan, -den, -tan, -ten)
 * with an apostrophe if needed for proper nouns.
 */
export function getAblativeSuffix(word: string, apostrophe = true): string {
    if (!word) return '';

    const locative = getLocativeSuffix(word, false);
    const suffix = `${locative}n`;

    return apostrophe ? `’${suffix}` : suffix;
}
