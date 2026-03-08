import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    Shirt,
    Scissors,
    Layers,
    Umbrella,
    MoreHorizontal,
    ShoppingBag,
    Loader2,
    ChevronRight,
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, query, where, orderBy, writeBatch } from 'firebase/firestore';
import { Design } from '@/data/designs';
import CheckoutBreadcrumbs from '@/components/CheckoutBreadcrumbs';

// Interfaces
interface GarmentType {
    id: string;
    name: string;
    description: string;
    base_stitching_price: number;
    default_fabric_consumption: number;
}

interface Fabric {
    id: string;
    name: string;
    description: string;
    price_per_meter: number;
    color?: string; // fallback visual
}

interface FabricColor {
    id: string;
    name: string;
    hex_code: string;
}

interface StandardSize {
    id: string;
    label: string;
    extra_price: number;
}

interface EmbroideryPricing {
    complexity: string;
    price: number;
}

// --- Icons Map ---
const GARMENT_ICONS: Record<string, any> = {
    'Blouse': Shirt,
    'Dress': Scissors,
    'Saree': Layers,
    'Saree Blouse': Shirt,
    'Kurta': Shirt,
    'Lehenga': Umbrella,
    'Gown': Scissors,
    'Salwar Kameez': Layers,
    'Other': MoreHorizontal,
};

// Data to populate Firestore if collection is empty
const INITIAL_SEEDED_GARMENTS: GarmentType[] = [
    { id: 'g_blouse', name: 'Blouse', description: 'Standard saree blouse stitching', base_stitching_price: 850, default_fabric_consumption: 1 },
    { id: 'g_kurta', name: 'Kurta', description: 'Basic kurta with lining', base_stitching_price: 650, default_fabric_consumption: 2.5 },
    { id: 'g_lehenga', name: 'Lehenga', description: 'Lehenga skirt with lining', base_stitching_price: 1500, default_fabric_consumption: 4 },
    { id: 'g_gown', name: 'Gown', description: 'Full length gown', base_stitching_price: 1800, default_fabric_consumption: 3.5 },
    { id: 'g_salwar', name: 'Salwar Kameez', description: 'Full set stitching', base_stitching_price: 1200, default_fabric_consumption: 4.5 },
];

const INITIAL_SEEDED_SIZES: StandardSize[] = [
    { id: 'sz_xs', label: 'XS', extra_price: 0 },
    { id: 'sz_s', label: 'S', extra_price: 0 },
    { id: 'sz_m', label: 'M', extra_price: 0 },
    { id: 'sz_l', label: 'L', extra_price: 0 },
    { id: 'sz_xl', label: 'XL', extra_price: 50 },
    { id: 'sz_xxl', label: 'XXL', extra_price: 100 },
    { id: 'sz_xxxl', label: 'XXXL', extra_price: 150 },
];

const SIZE_ORDER: Record<string, number> = {
    'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6, 'XXXL': 7
};

export default function EmbroideryCustomizationPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // --- Data State ---
    const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
    const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);
    const [fabrics, setFabrics] = useState<Fabric[]>([]);
    const [colors, setColors] = useState<FabricColor[]>([]);
    const [standardSizes, setStandardSizes] = useState<StandardSize[]>([]);
    const [embroideryPricing, setEmbroideryPricing] = useState<EmbroideryPricing[]>([]);

    // --- Selection State ---
    const [selectedGarment, setSelectedGarment] = useState<string | null>(null);
    const [selectedFabric, setSelectedFabric] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);

    // Size State
    const [sizeMode, setSizeMode] = useState<'standard' | 'custom'>('standard');
    const [selectedStandardSize, setSelectedStandardSize] = useState<string | null>(null);
    const [customMeasurements, setCustomMeasurements] = useState({
        chest: '',
        waist: '',
        hips: '',
        length: '',
        shoulder: '',
        sleeveLength: '',
        armHole: '',
        frontNeckDepth: '',
        backNeckDepth: '',
        inseam: '',
        notes: ''
    });

    // --- Derived State for Steps ---
    const isStep1Complete = !!selectedGarment;
    const isStep2Complete = !!selectedFabric;
    const isStep3Complete = !!selectedColor;
    const isStep4Complete = sizeMode === 'standard'
        ? !!selectedStandardSize
        : (customMeasurements.chest && customMeasurements.waist && customMeasurements.length);

    const canAddToBag = isStep1Complete && isStep2Complete && isStep3Complete && isStep4Complete;

    // --- Pricing Calculation ---
    const calculatePricing = () => {
        let fabricCost = 0;
        let stitchingCost = 0;
        let embroideryCost = 0;
        let sizeExtra = 0;

        // 1. Embroidery Cost
        if (selectedDesign && embroideryPricing.length > 0) {
            const pricing = embroideryPricing.find(p => p.complexity === selectedDesign.complexity);
            // Fallback to design base_price if no match or pricing missing
            embroideryCost = pricing ? pricing.price : (selectedDesign.base_price || 0);
        }

        // 2. Stitching Cost
        if (selectedGarment) {
            const garment = garmentTypes.find(g => g.id === selectedGarment);
            if (garment) {
                stitchingCost = garment.base_stitching_price || 0;
            }
        }

        // 3. Fabric Cost
        if (selectedFabric && selectedGarment) {
            const fabric = fabrics.find(f => f.id === selectedFabric);
            const garment = garmentTypes.find(g => g.id === selectedGarment);
            if (fabric && garment) {
                fabricCost = (fabric.price_per_meter || 0) * (garment.default_fabric_consumption || 0);
            }
        }

        // 4. Size Extra
        if (sizeMode === 'standard' && selectedStandardSize) {
            const size = standardSizes.find(s => s.id === selectedStandardSize);
            if (size) {
                sizeExtra = size.extra_price || 0;
            }
        }

        return {
            fabricCost,
            stitchingCost,
            embroideryCost,
            sizeExtra,
            total: fabricCost + stitchingCost + embroideryCost + sizeExtra
        };
    };

    const priceBreakdown = calculatePricing();

    // --- Fetch Data ---
    useEffect(() => {
        setMounted(true);
        if (!router.isReady) return;

        async function fetchData() {
            setIsLoading(true);
            try {
                const { designId } = router.query;

                // 1. Fetch Design
                if (designId) {
                    const docRef = doc(db, 'designs', designId as string);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const designData = docSnap.data();
                        let imageColor = 'bg-gray-50';
                        if (designData.category === 'Floral') imageColor = 'bg-rose-100';
                        else if (designData.category === 'Traditional') imageColor = 'bg-amber-100';
                        else if (designData.category === 'Modern') imageColor = 'bg-slate-100';
                        else imageColor = 'bg-gray-50';

                        setSelectedDesign({
                            id: docSnap.id,
                            name: designData.name || designData.title,
                            category: designData.category,
                            image: designData.image || imageColor,
                            descriptor: designData.short_description,
                            base_price: Number(designData.base_price) || 1200,
                            complexity: designData.complexity
                        } as any);
                    }
                }

                // 2. Fetch Garment Types
                // Assuming collection 'garment_types' exists
                const garmentsRef = collection(db, 'garment_types');
                // const qGarments = query(garmentsRef, where('is_active', '==', true)); // optional filter
                const garmentSnap = await getDocs(garmentsRef);
                const fetchedGarments: GarmentType[] = [];
                garmentSnap.forEach(d => {
                    const data = d.data();
                    if (data.is_active !== false) {
                        fetchedGarments.push({
                            id: d.id,
                            name: data.name,
                            description: data.description,
                            base_stitching_price: Number(data.base_stitching_price) || 0,
                            default_fabric_consumption: Number(data.default_fabric_consumption) || 0
                        });
                    }
                });
                if (fetchedGarments.length === 0) {
                    // Seed Firestore with Fallback Data
                    try {
                        const batch = writeBatch(db);
                        const newGarments: GarmentType[] = [];

                        INITIAL_SEEDED_GARMENTS.forEach((g) => {
                            const newDocRef = doc(collection(db, 'garment_types'));
                            // Remove id from data, use doc id or keep consistent?
                            // Let's keep the ID consistent if possible or let Firestore gen it.
                            // Here we let Firestore gen ID, but map it back.
                            const garmentData = {
                                name: g.name,
                                description: g.description,
                                base_stitching_price: g.base_stitching_price,
                                default_fabric_consumption: g.default_fabric_consumption,
                                is_active: true
                            };
                            batch.set(newDocRef, garmentData);
                            newGarments.push({ ...g, id: newDocRef.id });
                        });

                        await batch.commit();
                        console.log("Seeded garment_types to Firestore");
                        setGarmentTypes(newGarments);
                    } catch (seedErr) {
                        console.error("Error seeding garments:", seedErr);
                        setGarmentTypes(INITIAL_SEEDED_GARMENTS); // Fallback to local if seeding fails
                    }
                } else {
                    setGarmentTypes(fetchedGarments);
                }


                // 3. Fetch Fabrics
                const fabricsRef = collection(db, 'fabrics');
                const fabricSnap = await getDocs(fabricsRef);
                const fetchedFabrics: Fabric[] = [];
                const fabricNames = new Set();
                fabricSnap.forEach(d => {
                    const data = d.data();
                    if (data.is_active !== false && !fabricNames.has(data.name)) {
                        fabricNames.add(data.name);
                        fetchedFabrics.push({
                            id: d.id,
                            name: data.name,
                            description: data.description,
                            price_per_meter: Number(data.price_per_meter) || 0,
                            color: data.name.toLowerCase().includes('silk') ? '#D8C8B0' : '#F0EAD6'
                        });
                    }
                });
                setFabrics(fetchedFabrics);

                // 4. Fetch Colors
                const colorsRef = collection(db, 'fabric_colors');
                const colorSnap = await getDocs(colorsRef);
                const fetchedColors: FabricColor[] = [];
                const colorNames = new Set();
                colorSnap.forEach(d => {
                    const data = d.data();
                    if (data.is_active !== false && !colorNames.has(data.hex_code)) { // Dedupe by hex code
                        colorNames.add(data.hex_code);
                        fetchedColors.push({
                            id: d.id,
                            name: data.name,
                            hex_code: data.hex_code
                        });
                    }
                });
                setColors(fetchedColors);

                // 5. Fetch Standard Sizes
                const sizesRef = collection(db, 'standard_sizes');
                const sizeSnap = await getDocs(sizesRef);
                const fetchedSizes: StandardSize[] = [];
                const sizeLabels = new Set();

                sizeSnap.forEach(d => {
                    const data = d.data();
                    if (data.is_active !== false && !sizeLabels.has(data.label)) {
                        sizeLabels.add(data.label);
                        fetchedSizes.push({
                            id: d.id,
                            label: data.label,
                            extra_price: Number(data.extra_price) || 0
                        });
                    }
                });

                if (fetchedSizes.length === 0) {
                    // Seed Sizes
                    try {
                        const batch = writeBatch(db);
                        const newSizes: StandardSize[] = [];

                        INITIAL_SEEDED_SIZES.forEach((s) => {
                            const newDocRef = doc(collection(db, 'standard_sizes'));
                            const sizeData = {
                                label: s.label,
                                extra_price: s.extra_price,
                                is_active: true
                            };
                            batch.set(newDocRef, sizeData);
                            newSizes.push({ ...s, id: newDocRef.id });
                        });

                        await batch.commit();
                        console.log("Database initialized: Uploaded sizes to Firestore");
                        setStandardSizes(newSizes);
                    } catch (err) {
                        console.error("Error seeding sizes", err);
                        setStandardSizes(INITIAL_SEEDED_SIZES);
                    }
                } else {
                    // Sort logic
                    fetchedSizes.sort((a, b) => {
                        const orderA = SIZE_ORDER[a.label] || 99;
                        const orderB = SIZE_ORDER[b.label] || 99;
                        return orderA - orderB;
                    });
                    setStandardSizes(fetchedSizes);
                }

                // 6. Fetch Embroidery Pricing
                const pricingRef = collection(db, 'embroidery_pricing');
                const pricingSnap = await getDocs(pricingRef);
                const fetchedPricing: EmbroideryPricing[] = [];
                pricingSnap.forEach(d => {
                    const data = d.data();
                    fetchedPricing.push({
                        complexity: data.complexity,
                        price: Number(data.price)
                    });
                });
                setEmbroideryPricing(fetchedPricing);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        // Initialize state from query params if available (for editing/back navigation)
        const { garmentId, fabricId, colorId, sizeMode: qSizeMode, standardSizeId, custom_shoulder } = router.query;
        if (garmentId) setSelectedGarment(garmentId as string);
        if (fabricId) setSelectedFabric(fabricId as string);
        if (colorId) setSelectedColor(colorId as string);
        if (qSizeMode) setSizeMode(qSizeMode as 'standard' | 'custom');
        if (standardSizeId) setSelectedStandardSize(standardSizeId as string);

        // Check for custom measurements in query (checking one key is enough to assume existence)
        if (custom_shoulder) {
            const restoredCustom: any = {};
            Object.keys(router.query).forEach(key => {
                if (key.startsWith('custom_')) {
                    restoredCustom[key.replace('custom_', '')] = router.query[key];
                }
            });
            // Merge with default to ensure all fields exist
            setCustomMeasurements(prev => ({ ...prev, ...restoredCustom }));
        }

        fetchData();
    }, [router.isReady, router.query]);


    // ...

    // --- Handlers ---
    const handleGarmentSelect = (id: string) => setSelectedGarment(id);
    const handleFabricSelect = (id: string) => setSelectedFabric(id);
    const handleColorSelect = (id: string) => setSelectedColor(id);
    const handleSizeSelect = (id: string) => {
        setSizeMode('standard');
        setSelectedStandardSize(id);
    };

    const handleCustomChange = (field: string, value: string) => {
        setCustomMeasurements(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleContinue = async () => {
        if (!canAddToBag || !selectedDesign) return;

        // Redirect to Order Summary with selections as query params
        const query: any = {
            designId: selectedDesign.id,
            garmentId: selectedGarment,
            fabricId: selectedFabric,
            colorId: selectedColor,
            sizeMode,
            standardSizeId: selectedStandardSize,
            // Custom measurements need to be serialized if used
            ...Object.fromEntries(
                Object.entries(customMeasurements).map(([k, v]) => [`custom_${k}`, v])
            )
        };

        if (router.query.editId) {
            query.editId = router.query.editId;
        }

        router.push({
            pathname: '/order-summary-embroidery',
            query
        });
    };




    if (!mounted) return null;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F7F3]">
                <Loader2 className="animate-spin text-[#C9A14A]" size={32} />
            </div>
        );
    }

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-40 pt-[64px] md:pt-[72px]">
            <Head>
                <title>Customize Product | Amma Embroidery</title>
            </Head>

            <div className="w-full max-w-7xl mx-auto px-4 mt-8 mb-6 flex justify-center">
                <CheckoutBreadcrumbs
                    currentStep="customize"
                    designId={router.query.designId as string}
                    serviceType="stitching"
                />
            </div>

            <div className="max-w-md mx-auto px-4 pb-20 space-y-12">

                {/* Header */}
                <div className="mb-14 mt-4 text-center">
                    <h1 className="text-3xl font-serif font-light text-[#1C1C1C] mb-4 tracking-wide">
                        Customize Product
                    </h1>
                    <p className="text-[#5A5751] text-[10px] uppercase tracking-[0.2em] font-medium">
                        Embroidery & Stitching Service
                    </p>
                </div>

                {/* Step 1: Design Details */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-white rounded-none p-4 shadow-none flex items-center gap-4 border border-[#E8E6E0]"
                >
                    <div className="w-16 h-16 bg-[#F9F7F3] rounded-none flex-shrink-0 overflow-hidden relative">
                        <div className={`absolute inset-0 ${selectedDesign?.image || 'bg-gray-200'}`} />
                    </div>
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-[#999] font-medium mb-1">SELECTED DESIGN</p>
                        <h3 className="font-serif text-lg text-[#1C1C1C] tracking-wide">{selectedDesign?.name}</h3>
                        <p className="text-[10px] text-[#5A5751] uppercase tracking-[0.1em] mt-0.5">{selectedDesign?.category}</p>
                    </div>
                </motion.div>

                {/* Step 2: Garment Selection */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1C1C1C]">
                            1. Choose Garment
                        </h2>
                        {isStep1Complete && <Check size={14} className="text-[#C9A14A]" />}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {garmentTypes.map((type) => {
                            const Icon = GARMENT_ICONS[type.name] || Shirt;
                            const isSelected = selectedGarment === type.id;
                            return (
                                <motion.button
                                    key={type.id}
                                    variants={fadeInUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleGarmentSelect(type.id)}
                                    className={`
                                        relative flex flex-col items-center justify-center p-6 rounded-none border transition-all duration-300 bg-white
                                        ${isSelected ? 'border-[#C9A14A] shadow-[0_10px_30px_-10px_rgba(201,161,74,0.1)]' : 'border-[#E8E6E0] hover:border-[#C9A14A]/50'}
                                    `}
                                >
                                    <div className={`mb-4 p-4 rounded-none transition-colors duration-300 ${isSelected ? 'text-[#C9A14A]' : 'text-[#999] group-hover:text-[#C9A14A]'} `}>
                                        <Icon size={24} strokeWidth={1.5} />
                                    </div>
                                    <span className={`text-[10px] uppercase tracking-[0.1em] font-medium text-center ${isSelected ? 'text-[#1C1C1C]' : 'text-[#555]'} `}>
                                        {type.name}
                                    </span>
                                    <span className="text-[11px] font-medium tracking-wide text-[#1C1C1C] mt-2">
                                        ₹{type.base_stitching_price}
                                    </span>
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 text-[#C9A14A]">
                                            <Check size={14} strokeWidth={2} />
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </section>

                {/* Step 3: Fabric Selection */}
                <section className={`transition-opacity duration-500 ${!isStep1Complete ? 'opacity-40 pointer-events-none grayscale' : ''} `}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1C1C1C]">
                            2. Choose Fabric
                        </h2>
                        {isStep2Complete && <Check size={14} className="text-[#C9A14A]" />}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {fabrics.map((fabric) => (
                            <motion.div
                                key={fabric.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleFabricSelect(fabric.id)}
                                className={`
                                    relative p-4 rounded-none border cursor-pointer transition-all duration-300 bg-white
                                    ${selectedFabric === fabric.id ? 'border-[#C9A14A] shadow-[0_10px_30px_-10px_rgba(201,161,74,0.1)]' : 'border-[#E8E6E0] hover:border-[#C9A14A]/50'}
                                `}
                            >
                                <div
                                    className="h-24 w-full rounded-none mb-4 border border-[#1C1C1C]/5 relative overflow-hidden"
                                    style={{
                                        backgroundColor: fabric.color,
                                    }}
                                >
                                    {/* Texture overlay */}
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                                </div>

                                <h3 className="font-medium text-xs tracking-wide text-[#1C1C1C] uppercase">{fabric.name}</h3>
                                <p className="text-[10px] text-[#777] mt-1.5 line-clamp-2 leading-relaxed">{fabric.description}</p>
                                <p className="text-[11px] font-medium tracking-wide text-[#1C1C1C] mt-3">₹{fabric.price_per_meter}/m</p>
                                {selectedFabric === fabric.id && (
                                    <div className="absolute top-3 right-3 text-[#1C1C1C]">
                                        <Check size={14} strokeWidth={2} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Step 4: Color Selection */}
                <section className={`transition-opacity duration-500 ${!isStep2Complete ? 'opacity-40 pointer-events-none grayscale' : ''} `}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1C1C1C]">
                            3. Choose Color
                        </h2>
                        {isStep3Complete && <Check size={14} className="text-[#C9A14A]" />}
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                        {colors.map((color) => (
                            <motion.button
                                key={color.id}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleColorSelect(color.id)}
                                className={`
                                    aspect-square rounded-none relative focus:outline-none transition-all duration-300
                                    ${selectedColor === color.id ? 'ring-1 ring-offset-4 ring-[#C9A14A] scale-95 shadow-[0_10px_30px_-10px_rgba(201,161,74,0.2)]' : 'hover:scale-105 shadow-sm border border-[#E8E6E0] hover:border-[#C9A14A]/50'}
                                `}
                                style={{ backgroundColor: color.hex_code }}
                                aria-label={color.name}
                            >
                                {selectedColor === color.id && (
                                    <span className="absolute inset-0 flex items-center justify-center text-white mix-blend-difference">
                                        <Check size={16} strokeWidth={2} />
                                    </span>
                                )}
                            </motion.button>
                        ))}
                    </div>
                    <div className="h-6 mt-4 text-center">
                        {selectedColor && (
                            <span className="text-[9px] uppercase tracking-[0.2em] text-[#1C1C1C] font-medium">
                                {colors.find(c => c.id === selectedColor)?.name}
                            </span>
                        )}
                    </div>
                </section>

                {/* Step 5: Size & Measurements */}
                <section className={`transition-opacity duration-500 ${!isStep3Complete ? 'opacity-40 pointer-events-none grayscale' : ''} `}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1C1C1C]">
                            4. Size & Fit
                        </h2>
                        {isStep4Complete && <Check size={14} className="text-[#C9A14A]" />}
                    </div>

                    <div className="flex bg-white p-1 rounded-none border border-[#E8E6E0] mb-8 w-fit mx-auto shadow-none">
                        <button
                            onClick={() => setSizeMode('standard')}
                            className={`px-6 py-2 rounded-none text-[10px] uppercase tracking-[0.1em] font-medium transition-all ${sizeMode === 'standard' ? 'bg-[#C9A14A] text-white' : 'text-[#777] hover:bg-[#C9A14A]/10 hover:text-[#C9A14A]'
                                } `}
                        >
                            Standard Size
                        </button>
                        <button
                            onClick={() => setSizeMode('custom')}
                            className={`px-8 py-2 rounded-none text-[10px] uppercase tracking-[0.1em] font-medium transition-all ${sizeMode === 'custom' ? 'bg-[#C9A14A] text-white' : 'text-[#777] hover:bg-[#C9A14A]/10 hover:text-[#C9A14A]'
                                } `}
                        >
                            Custom
                        </button>
                    </div>

                    {sizeMode === 'standard' && (
                        <div className="grid grid-cols-3 gap-3">
                            {standardSizes.map((size) => (
                                <button
                                    key={size.id}
                                    onClick={() => handleSizeSelect(size.id)}
                                    className={`
                                        py-4 rounded-none border text-[10px] uppercase tracking-[0.1em] font-medium transition-all flex flex-col items-center justify-center
                                        ${selectedStandardSize === size.id
                                            ? 'border-[#C9A14A] bg-[#C9A14A] text-white shadow-[0_10px_30px_-10px_rgba(201,161,74,0.2)]'
                                            : 'border-[#E8E6E0] bg-white text-[#555] hover:border-[#C9A14A]/50'
                                        }
                                    `}
                                >
                                    <span>{size.label}</span>
                                    {size.extra_price > 0 && (
                                        <span className={`text-[9px] uppercase tracking-[0.1em] mt-1 ${selectedStandardSize === size.id ? 'text-white/70' : 'text-[#999]'}`}>+₹{size.extra_price}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {sizeMode === 'custom' && (
                        <div className="bg-white p-6 rounded-none border border-[#E8E6E0] space-y-8 shadow-none">
                            <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1C1C1C]">Body Measurements</h3>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.1em] text-[#777] mb-2 block font-medium">Chest (in)</label>
                                    <input type="number" value={customMeasurements.chest} onChange={(e) => handleCustomChange('chest', e.target.value)} className="w-full p-3 bg-[#F9F7F3] rounded-none border border-transparent focus:border-[#C9A14A] focus:bg-white outline-none text-sm transition-all" placeholder="32" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.1em] text-[#777] mb-2 block font-medium">Waist (in)</label>
                                    <input type="number" value={customMeasurements.waist} onChange={(e) => handleCustomChange('waist', e.target.value)} className="w-full p-3 bg-[#F9F7F3] rounded-none border border-transparent focus:border-[#C9A14A] focus:bg-white outline-none text-sm transition-all" placeholder="28" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.1em] text-[#777] mb-2 block font-medium">Hips (in)</label>
                                    <input type="number" value={customMeasurements.hips} onChange={(e) => handleCustomChange('hips', e.target.value)} className="w-full p-3 bg-[#F9F7F3] rounded-none border border-transparent focus:border-[#C9A14A] focus:bg-white outline-none text-sm transition-all" placeholder="36" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.1em] text-[#777] mb-2 block font-medium">Shoulder (in)</label>
                                    <input type="number" value={customMeasurements.shoulder} onChange={(e) => handleCustomChange('shoulder', e.target.value)} className="w-full p-3 bg-[#F9F7F3] rounded-none border border-transparent focus:border-[#C9A14A] focus:bg-white outline-none text-sm transition-all" placeholder="14" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.1em] text-[#777] mb-2 block font-medium">Sleeve Length (in)</label>
                                    <input type="number" value={customMeasurements.sleeveLength} onChange={(e) => handleCustomChange('sleeveLength', e.target.value)} className="w-full p-3 bg-[#F9F7F3] rounded-none border border-transparent focus:border-[#C9A14A] focus:bg-white outline-none text-sm transition-all" placeholder="5" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.1em] text-[#777] mb-2 block font-medium">Arm Hole (in)</label>
                                    <input type="number" value={customMeasurements.armHole} onChange={(e) => handleCustomChange('armHole', e.target.value)} className="w-full p-3 bg-[#F9F7F3] rounded-none border border-transparent focus:border-[#C9A14A] focus:bg-white outline-none text-sm transition-all" placeholder="16" />
                                </div>
                            </div>

                            <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1C1C1C] pt-6 border-t border-[#E8E6E0]">Neck & Fit</h3>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.1em] text-[#777] mb-2 block font-medium">Front Neck Depth (in)</label>
                                    <input type="number" value={customMeasurements.frontNeckDepth} onChange={(e) => handleCustomChange('frontNeckDepth', e.target.value)} className="w-full p-3 bg-[#F9F7F3] rounded-none border border-transparent focus:border-[#C9A14A] focus:bg-white outline-none text-sm transition-all" placeholder="7" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.1em] text-[#777] mb-2 block font-medium">Back Neck Depth (in)</label>
                                    <input type="number" value={customMeasurements.backNeckDepth} onChange={(e) => handleCustomChange('backNeckDepth', e.target.value)} className="w-full p-3 bg-[#F9F7F3] rounded-none border border-transparent focus:border-[#C9A14A] focus:bg-white outline-none text-sm transition-all" placeholder="8" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.1em] text-[#777] mb-2 block font-medium">Full Length (in)</label>
                                    <input type="number" value={customMeasurements.length} onChange={(e) => handleCustomChange('length', e.target.value)} className="w-full p-3 bg-[#F9F7F3] rounded-none border border-transparent focus:border-[#C9A14A] focus:bg-white outline-none text-sm transition-all" placeholder="40" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.1em] text-[#777] mb-2 block font-medium">Inseam (Bottoms) (in)</label>
                                    <input type="number" value={customMeasurements.inseam} onChange={(e) => handleCustomChange('inseam', e.target.value)} className="w-full p-3 bg-[#F9F7F3] rounded-none border border-transparent focus:border-[#C9A14A] focus:bg-white outline-none text-sm transition-all" placeholder="30" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-[0.1em] text-[#777] mb-2 block font-medium">Notes / Special Instructions</label>
                                <textarea value={customMeasurements.notes} onChange={(e) => handleCustomChange('notes', e.target.value)} rows={3} className="w-full p-3 bg-[#F9F7F3] rounded-none border border-transparent focus:border-[#C9A14A] focus:bg-white outline-none text-sm transition-all resize-none" placeholder="Any specific requirements regarding fit, buttons, lining etc..." />
                            </div>
                        </div>
                    )}
                </section>

                {/* Price Summary Breakdown */}
                {selectedGarment && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-none p-6 shadow-none border border-[#E8E6E0] space-y-4"
                    >
                        <h3 className="font-serif text-2xl font-light text-[#1C1C1C] mb-4 border-b border-[#E8E6E0] pb-4">Estimated Price</h3>

                        <div className="flex justify-between text-[11px] tracking-wide text-[#5A5751] uppercase">
                            <span>Embroidery Design ({selectedDesign?.complexity || 'Standard'})</span>
                            <span>₹{priceBreakdown.embroideryCost.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-[11px] tracking-wide text-[#5A5751] uppercase">
                            <span>Stitching Service</span>
                            <span>₹{priceBreakdown.stitchingCost.toFixed(2)}</span>
                        </div>

                        {priceBreakdown.fabricCost > 0 && (
                            <div className="flex justify-between text-[11px] tracking-wide text-[#5A5751] uppercase">
                                <span>Fabric Cost ({garmentTypes.find(g => g.id === selectedGarment)?.default_fabric_consumption}m)</span>
                                <span>₹{priceBreakdown.fabricCost.toFixed(2)}</span>
                            </div>
                        )}

                        {priceBreakdown.sizeExtra > 0 && (
                            <div className="flex justify-between text-[11px] tracking-wide text-[#5A5751] uppercase">
                                <span>Size Adjustment</span>
                                <span>₹{priceBreakdown.sizeExtra.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex justify-between font-serif text-xl text-[#1C1C1C] pt-4 border-t border-[#E8E6E0] mt-4">
                            <span>Total Estimate</span>
                            <span>₹{priceBreakdown.total.toFixed(2)}</span>
                        </div>
                        <p className="text-[9px] uppercase tracking-[0.1em] text-[#999] mt-2 leading-relaxed">
                            *Final price may vary slightly based on specific customization requests.
                        </p>
                    </motion.div>
                )}

            </div>

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E6E0] p-4 pb-8 safe-area-pb z-50">
                <div className="max-w-md mx-auto flex items-center justify-between gap-6">
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-[#999] font-medium mb-1">Total Estimate</p>
                        <p className="font-serif text-2xl text-[#1C1C1C] tracking-wide">₹{priceBreakdown.total.toFixed(2)}</p>
                    </div>
                    <button
                        onClick={handleContinue}
                        disabled={!canAddToBag}
                        className={`
                            px-8 py-4 rounded-none font-medium text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-all duration-300
                            ${canAddToBag
                                ? 'bg-[#1C1C1C] text-white hover:bg-[#C9A14A] hover:shadow-[0_10px_30px_-10px_rgba(201,161,74,0.3)] transition-colors border border-transparent hover:border-[#C9A14A]'
                                : 'bg-[#E8E6E0] text-[#999] cursor-not-allowed border border-[#E8E6E0]'
                            }
                        `}
                    >
                        <span>Continue</span>
                        <ChevronRight size={14} strokeWidth={2} />
                    </button>
                </div>
            </div>

        </div>
    );
}
