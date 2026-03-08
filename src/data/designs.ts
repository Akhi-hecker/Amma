export interface Design {
    id: string;
    name: string;      // Mapped from 'title'
    category: string;  // Mapped from 'category'
    image: string;     // Computed based on props/category
    descriptor: string; // Mapped from 'short_description'
    badge?: string;
    // New fields from DB
    long_description?: string;
    fabric_suitability?: string;
    complexity?: string;
    base_price?: number;
    is_active?: boolean;
}

// NOTE: Hardcoded DESIGNS array has been removed.
// Data is now fetched from Supabase 'designs' table.
// Data is now fetched from Firebase 'designs' collection.
export const DESIGNS: Design[] = [];

export const EXAMPLE_DESIGNS: Design[] = [
    {
        id: 'ex-1',
        name: 'Royal Zardosi Motif',
        category: 'Bridal',
        image: 'bg-red-50',
        descriptor: 'Intricate gold threading for bridal wear',
        long_description: 'A masterpiece of traditional Indian embroidery featuring heavy Zardosi work with pure zari threads.',
        fabric_suitability: 'Silk, Velvet',
        complexity: 'High',
        base_price: 15000,
        is_active: true
    },
    {
        id: 'ex-2',
        name: 'Rose Gold Floral Symphony',
        category: 'Floral',
        image: 'bg-rose-100',
        descriptor: 'Delicate floral vines in pastel hues',
        long_description: 'Subtle yet stunning floral patterns incorporating beads and sequins in rose gold tones.',
        fabric_suitability: 'Organza, Net',
        complexity: 'Medium',
        base_price: 8500,
        is_active: true
    },
    {
        id: 'ex-3',
        name: 'Geometric Pearl Embellishment',
        category: 'Modern',
        image: 'bg-slate-100',
        descriptor: 'Contemporary pearl and crystal work',
        long_description: 'A modern take on hand embroidery using structured geometric patterns filled with pearls.',
        fabric_suitability: 'Crepe, Georgette',
        complexity: 'Medium',
        base_price: 12000,
        is_active: true
    },
    {
        id: 'ex-4',
        name: 'Classic Mango Border',
        category: 'Traditional',
        image: 'bg-amber-100',
        descriptor: 'Timeless paisley patterns in aari work',
        long_description: 'The quintessential South Indian mango (paisley) border design perfected with fine aari embroidery.',
        fabric_suitability: 'Cotton Silk, Kanchipuram',
        complexity: 'Medium',
        base_price: 6000,
        is_active: true
    },
    {
        id: 'ex-5',
        name: 'Minimalist Linear Accent',
        category: 'Minimal',
        image: 'bg-green-50',
        descriptor: 'Sleek and subtle thread work',
        long_description: 'For those who prefer understated elegance. Clean lines and minimal scattered motifs.',
        fabric_suitability: 'Linen, Cotton',
        complexity: 'Low',
        base_price: 3500,
        is_active: true
    },
    {
        id: 'ex-6',
        name: 'Heavy Gota Patti Gala',
        category: 'Heavy',
        image: 'bg-purple-100',
        descriptor: 'Dense silver and gold appliqué work',
        long_description: 'Luxurious Rajasthani style Gota Patti work covering the entire neckline and sleeves.',
        fabric_suitability: 'Georgette, Chiffon',
        complexity: 'High',
        base_price: 22000,
        is_active: true
    },
    {
        id: 'ex-7',
        name: 'Festive Mirror Work',
        category: 'Festive',
        image: 'bg-yellow-50',
        descriptor: 'Vibrant threads with real glass mirrors',
        long_description: 'Bright, colorful, and sparkling. Real mirror work authentic to Gujarati textile traditions.',
        fabric_suitability: 'Cotton, Rayon',
        complexity: 'High',
        base_price: 9500,
        is_active: true
    },
    {
        id: 'ex-8',
        name: 'Scalloped Cutwork Border',
        category: 'Border',
        image: 'bg-orange-50',
        descriptor: 'Exquisite cutwork edging for dupattas',
        long_description: 'Precision cutwork embroidery creating a beautiful scalloped edge effect for borders.',
        fabric_suitability: 'Organza, Tissue',
        complexity: 'High',
        base_price: 7800,
        is_active: true
    },
    {
        id: 'ex-9',
        name: 'Kundan Velvet Bliss',
        category: 'Bridal',
        image: 'bg-red-50',
        descriptor: 'Regal kundan stones on rich velvet',
        long_description: 'Heavy bridal embroidery featuring authentic Kundan stones set in pure gold threads.',
        fabric_suitability: 'Velvet, Raw Silk',
        complexity: 'High',
        base_price: 35000,
        is_active: true
    },
    {
        id: 'ex-10',
        name: 'Abstract Thread Painting',
        category: 'Modern',
        image: 'bg-slate-100',
        descriptor: 'Freehand embroidery in monochrome',
        long_description: 'Artistic thread painting technique creating abstract modern motifs for contemporary wear.',
        fabric_suitability: 'Linen, Canvas',
        complexity: 'Medium',
        base_price: 6500,
        is_active: true
    },
    {
        id: 'ex-11',
        name: 'Lotus Temple Arch',
        category: 'Traditional',
        image: 'bg-amber-100',
        descriptor: 'Temple jewelry inspired motifs',
        long_description: 'Intricate temple border designs featuring the sacred lotus flower in metallic threads.',
        fabric_suitability: 'Silk, Brocade',
        complexity: 'Medium',
        base_price: 8900,
        is_active: true
    },
    {
        id: 'ex-12',
        name: 'Pastel Sequin Shower',
        category: 'Festive',
        image: 'bg-yellow-50',
        descriptor: 'Holographic sequins in a gradient',
        long_description: 'A magical gradient effect created using tiny holographic sequins in pastel shades.',
        fabric_suitability: 'Net, Chiffon',
        complexity: 'High',
        base_price: 14000,
        is_active: true
    }
];
