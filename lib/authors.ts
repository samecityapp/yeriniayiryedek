export type Author = {
    id: string;
    name: string;
    role: string;
    image: string;
    bio: string;
};

export const AUTHORS: Author[] = [
    {
        id: 'selin',
        name: 'Selin Aktaş',
        role: 'Kıdemli Seyahat Editörü',
        image: '/authors/selin.png',
        bio: 'Ege köylerine ve butik otellere olan tutkusuyla tanınan Selin, 10 yılı aşkın süredir Türkiye\'nin gizli kalmış rotalarını keşfediyor.'
    },
    {
        id: 'melis',
        name: 'Melis Yıldız',
        role: 'Lüks Konaklama Uzmanı',
        image: '/authors/melis.png',
        bio: 'Modern konfor ve estetik detaylara önem veren Melis, lüks oteller ve tasarım butik konaklamalar üzerine uzmanlaşmıştır.'
    },
    {
        id: 'elif',
        name: 'Elif Demir',
        role: 'Doğa ve Huzur Rotaları Rehberi',
        image: '/authors/elif.png',
        bio: 'Sakinlik ve doğayla iç içe tatil anlayışını benimseyen Elif, kamp alanlarından orman köşklerine kadar en huzurlu durakları seçer.'
    }
];

export function getRandomAuthor(seed?: string): Author {
    // Return Selin or Melis for now
    const candidates = AUTHORS.filter(a => a.id !== 'elif');

    if (seed) {
        // Deterministic selection based on seed string
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % candidates.length;
        return candidates[index];
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
}

export function getAuthorById(id: string): Author | undefined {
    return AUTHORS.find(a => a.id === id);
}

