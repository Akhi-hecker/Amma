
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs, query, where, writeBatch, doc } = require("firebase/firestore");
const fs = require('fs');
const path = require('path');

// Load environment variables manually
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
    process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const FABRICS = [
    {
        name: 'Raw Silk',
        description: 'Rich texture with a subtle sheen, perfect for structured garments.',
        price_per_meter: 850,
        is_active: true
    },
    {
        name: 'Pure Cotton',
        description: 'Breathable and soft, ideal for daily wear and comfort.',
        price_per_meter: 350,
        is_active: true
    },
    {
        name: 'Velvet',
        description: 'Luxurious and soft piles, adding grandeur to any outfit.',
        price_per_meter: 1200,
        is_active: true
    },
    {
        name: 'Organza',
        description: 'Sheer, crisp, and lightweight fabric for a delicate look.',
        price_per_meter: 650,
        is_active: true
    },
    {
        name: 'Crepe',
        description: 'Flowy fabric with a grainy texture, drapes beautifully.',
        price_per_meter: 550,
        is_active: true
    }
];

const COLORS = [
    { name: 'Royal Red', hex_code: '#8B0000', is_active: true },
    { name: 'Navy Blue', hex_code: '#000080', is_active: true },
    { name: 'Emerald Green', hex_code: '#50C878', is_active: true },
    { name: 'Ivory', hex_code: '#FFFFF0', is_active: true },
    { name: 'Black', hex_code: '#000000', is_active: true },
    { name: 'Gold', hex_code: '#FFD700', is_active: true },
    { name: 'Silver', hex_code: '#C0C0C0', is_active: true }
];

async function seed() {
    console.log('Starting fabric and color seeding...');
    const batch = writeBatch(db);
    let count = 0;

    // Seed Fabrics
    const fabricsCol = collection(db, 'fabrics');
    for (const item of FABRICS) {
        // Check for duplicates by name
        const q = query(fabricsCol, where("name", "==", item.name));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            const newRef = doc(collection(db, 'fabrics'));
            batch.set(newRef, { ...item, created_at: new Date().toISOString() });
            console.log(`Prepared Fabric: ${item.name}`);
            count++;
        } else {
            console.log(`Skipping existing Fabric: ${item.name}`);
        }
    }

    // Seed Colors
    const colorsCol = collection(db, 'fabric_colors');
    for (const item of COLORS) {
        // Check for duplicates by name
        const q = query(colorsCol, where("name", "==", item.name));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            const newRef = doc(collection(db, 'fabric_colors'));
            batch.set(newRef, { ...item, created_at: new Date().toISOString() });
            console.log(`Prepared Color: ${item.name}`);
            count++;
        } else {
            console.log(`Skipping existing Color: ${item.name}`);
        }
    }

    if (count > 0) {
        await batch.commit();
        console.log(`Successfully added ${count} items.`);
    } else {
        console.log('No new items to add.');
    }

    console.log('Seeding complete.');
    process.exit(0);
}

seed().catch(console.error);
