
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs, query, where, writeBatch, doc } = require("firebase/firestore");
const fs = require('fs');
const path = require('path');

// Load environment variables manually since we might not have dotenv
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            envContent.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^['"]|['"]$/g, '');
                    process.env[key] = value;
                }
            });
            console.log('Loaded environment variables from .env.local');
        } else {
            console.warn('.env.local not found');
        }
    } catch (e) {
        console.warn('Error loading .env.local', e);
    }
}

loadEnv();

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if config is present
if (!firebaseConfig.apiKey) {
    console.error('ERROR: Firebase configuration missing in .env.local');
    console.error('Please add NEXT_PUBLIC_FIREBASE_API_KEY, etc.');
    process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DESIGNS = [
    {
        id: 'ex-001',
        name: 'Royal Peacock Bridal',
        category: 'Bridal',
        image: 'bg-red-50',
        descriptor: 'Intricate peacock motifs with gold zari work.',
        long_description: 'A stunning bridal masterpiece featuring elaborate peacock motifs intertwined with traditional vine patterns. Hand-crafted using premium gold zari and silk threads, this design radiates elegance and grandeur, perfect for the main wedding ceremony.',
        fabric_suitability: 'Silk, Velvet, Raw Silk',
        complexity: 'High',
        base_price: 12000,
        is_active: true
    },
    {
        id: 'ex-002',
        name: 'Classic Rose Vine',
        category: 'Floral',
        image: 'bg-rose-100',
        descriptor: 'Delicate rose vines climbing the neckline.',
        long_description: 'Timeless beauty captured in thread. This design features soft pink and red roses connected by lush green vines, creating a romantic and feminine look. Ideal for engagement blouses or festive wear.',
        fabric_suitability: 'Cotton, Chanderi, Georgette',
        complexity: 'Medium',
        base_price: 4500,
        is_active: true
    },
    {
        id: 'ex-003',
        name: 'Geometric Gold Borders',
        category: 'Border',
        image: 'bg-orange-50',
        descriptor: 'Sharp geometric patterns for sleeves and hem.',
        long_description: 'Modernity meets tradition. This design focuses on sharp, clean geometric lines and shapes executed in bright gold thread. It adds a contemporary touch to traditional sarees and is perfect for distinct sleeve detailing.',
        fabric_suitability: 'Silk, Cotton Silk, Crepe',
        complexity: 'Low',
        base_price: 3000,
        is_active: true
    },
    {
        id: 'ex-004',
        name: 'Minimalist Buttas',
        category: 'Minimal',
        image: 'bg-green-50',
        descriptor: 'Scattered small floral motifs.',
        long_description: 'Less is more. Tiny, perfectly spaced floral buttas scattered across the back and sleeves. This design offers a subtle elegance that complements rather than overpowers the saree. Great for office wear or light functions.',
        fabric_suitability: 'Linen, Cotton, Organza',
        complexity: 'Low',
        base_price: 2500,
        is_active: true
    },
    {
        id: 'ex-005',
        name: 'Temple Architecture',
        category: 'Traditional',
        image: 'bg-amber-100',
        descriptor: 'Inspired by ancient temple carvings.',
        long_description: 'A homage to heritage. This heavy design mimics the stone carvings of ancient South Indian temples, featuring pillars, deities, and deeply embossed traditional motifs. A grand choice for Kanjeevaram sarees.',
        fabric_suitability: 'Pure Silk, Kanjeevaram',
        complexity: 'High',
        base_price: 15000,
        is_active: true
    },
    {
        id: 'ex-006',
        name: 'Festive Glitter',
        category: 'Festive',
        image: 'bg-yellow-50',
        descriptor: 'Sparkling sequins and mirror work.',
        long_description: 'Ready to party. This vibrant design combines colorful embroidery with reflective mirror work and sequins, ensuring you catch the light from every angle. Perfect for Sangeet, Garba nights, or festive celebrations.',
        fabric_suitability: 'Chiffon, Georgette, Net',
        complexity: 'Medium',
        base_price: 5500,
        is_active: true
    },
    {
        id: 'ex-007',
        name: 'Modern Abstract',
        category: 'Modern',
        image: 'bg-slate-100',
        descriptor: 'Contemporary abstract lines and shapes.',
        long_description: 'For the avant-garde fashionista. Breaking away from florals and paisleys, this design uses abstract lines, curves, and negative space to create a unique piece of wearable art.',
        fabric_suitability: 'Satin, Crepe, Modern Silks',
        complexity: 'Medium',
        base_price: 4800,
        is_active: true
    },
    {
        id: 'ex-008',
        name: 'Heavy Zardosi Maggam',
        category: 'Heavy',
        image: 'bg-purple-100',
        descriptor: 'Rich Zardosi work with stone embellishments.',
        long_description: 'The epitome of luxury. This heavy Maggam work design is laden with Zardosi coil work, kundans, and semi-precious stones. It transforms a blouse into jewelry, meant for the bride who wants nothing but the best.',
        fabric_suitability: 'Velvet, Heavy Silk',
        complexity: 'High',
        base_price: 18000,
        is_active: true
    }
];

async function migrate() {
    console.log('Starting migration...');
    const designsCollection = collection(db, 'designs');

    // Check if designs already exist
    const snapshot = await getDocs(designsCollection);
    if (!snapshot.empty) {
        console.log(`Found ${snapshot.size} existing designs. Skipping migration check to avoid duplicates.`);
        // Assuming we want to upsert or check duplicates, but for now let's just add if name doesn't exist?
        // Let's iterate and add if not present by name (simple dedupe)
    }

    const batch = writeBatch(db);
    let count = 0;

    for (const design of DESIGNS) {
        // Check if design with this name exists
        const q = query(designsCollection, where("name", "==", design.name));
        const qSnap = await getDocs(q);

        if (qSnap.empty) {
            // Use existing ID to preserve compatibility
            const newDocRef = doc(db, 'designs', design.id);
            const designWithTimestamp = { ...design, created_at: new Date().toISOString() };
            batch.set(newDocRef, designWithTimestamp);
            count++;
            console.log(`Prepared to add: ${design.name} (ID: ${design.id})`);
        } else {
            console.log(`Skipping existing: ${design.name}`);
        }
    }

    if (count > 0) {
        await batch.commit();
        console.log(`Successfully added ${count} designs.`);
    } else {
        console.log('No new designs to add.');
    }

    console.log('Migration complete.');
    process.exit(0);
}

migrate().catch(console.error);
