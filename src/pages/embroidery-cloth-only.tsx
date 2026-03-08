import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, ChevronRight, Ruler, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

import { Design } from '@/data/designs';
import CheckoutBreadcrumbs from '@/components/CheckoutBreadcrumbs';

// Interfaces
interface Fabric {
    id: string;
    name: string;
    description: string;
    price_per_meter: number;
    color: string;
    note?: string;
}

interface FabricColor {
    id: string;
    name: string;
    hex_code: string;
}


export default function EmbroideryClothOnlyPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Data State
    const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
    const [fabrics, setFabrics] = useState<Fabric[]>([]);
    const [colors, setColors] = useState<FabricColor[]>([]);


    // Selection State
    const [selectedFabric, setSelectedFabric] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);

    // Derived
    const currentFabric = fabrics.find(f => f.id === selectedFabric);
    const currentColor = colors.find(c => c.id === selectedColor);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
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
                        // Minimal Mapping for UI
                        let imageColor = 'bg-gray-50';
                        if (designData.category === 'Floral') imageColor = 'bg-rose-100';
                        else if (designData.category === 'Traditional') imageColor = 'bg-amber-100';
                        else imageColor = 'bg-slate-100';

                        const mappedDesign: Design = {
                            id: docSnap.id,
                            name: designData.name || designData.title, // Handle naming diffs
                            category: designData.category,
                            image: designData.image || imageColor,
                            descriptor: designData.short_description || designData.descriptor || '',
                            long_description: designData.long_description,
                            fabric_suitability: designData.fabric_suitability,
                            complexity: designData.complexity,
                            base_price: Number(designData.base_price) || 1200,
                            is_active: designData.is_active
                        } as Design;
                        setSelectedDesign(mappedDesign);
                    }
                }

                // 2. Fetch Fabrics
                const fabricsRef = collection(db, 'fabrics');
                // const qFabrics = query(fabricsRef, where('is_active', '==', true)); // Verify index exists or simplify
                const fabricSnap = await getDocs(fabricsRef); // Fetch all and filter if needed or assume active

                const fetchedFabrics: Fabric[] = [];
                fabricSnap.forEach(doc => {
                    const d = doc.data();
                    if (d.is_active !== false) { // defaulting to true if missing
                        fetchedFabrics.push({
                            id: doc.id,
                            name: d.name,
                            description: d.description,
                            price_per_meter: Number(d.price_per_meter) || 0,
                            note: d.description,
                            color: d.name.toLowerCase().includes('silk') ? '#D8C8B0' : '#F0EAD6'
                        });
                    }
                });
                setFabrics(fetchedFabrics);


                // 3. Fetch Colors
                const colorsRef = collection(db, 'fabric_colors');
                const colorSnap = await getDocs(colorsRef);
                const fetchedColors: FabricColor[] = [];
                colorSnap.forEach(doc => {
                    const d = doc.data();
                    if (d.is_active !== false) {
                        fetchedColors.push({
                            id: doc.id,
                            name: d.name,
                            hex_code: d.hex_code || '#CCCCCC'
                        });
                    }
                });
                setColors(fetchedColors);

                // 4. Fetch Lengths - Removed as per requirement

            } catch (error) {
                console.error("Error fetching customization data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [router.isReady, router.query]);


    // Initialization from Query Params
    useEffect(() => {
        if (!mounted || isLoading) return;
        const { fabricId, colorId } = router.query;
        if (fabricId) setSelectedFabric(fabricId as string);
        if (colorId) setSelectedColor(colorId as string);
    }, [mounted, isLoading, router.query]);

    // Logic
    // Default length to 1 meter as feature is removed
    const validLength = 1;

    // Price Calculation
    // Total = Design Base Price + (Fabric Price Per Meter * Length)
    const baseDesignPrice = selectedDesign?.base_price || 0;
    const fabricCost = currentFabric ? (Number(currentFabric.price_per_meter) * validLength) : 0;
    const totalPrice = baseDesignPrice + fabricCost;

    const isStep1Complete = !!selectedFabric;
    const isStep2Complete = !!selectedColor;
    const canContinue = isStep1Complete && isStep2Complete;

    const handleFabricSelect = (id: string) => setSelectedFabric(id);
    const handleColorSelect = (id: string) => setSelectedColor(id);

    // --- Animation Variants ---


    // --- Animation Variants ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    // --- Navigation ---
    const handleContinue = () => {
        if (!canContinue) return;

        // Find ID for preset length if applicable
        router.push({
            pathname: '/order-summary-embroidery',
            query: {
                designId: selectedDesign?.id,
                fabricId: selectedFabric,
                colorId: selectedColor,
                length: validLength,
                editId: router.query.editId
            }
        });
    };

    if (!mounted) return null;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F7F3]">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-[#C9A14A]" size={32} />
                    <p className="text-[#555555] text-sm">Loading customization options...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-32 pt-[64px] md:pt-[72px]">
            <Head>
                <title>Customize Fabric | Amma Embroidery</title>
            </Head>

            {/* Breadcrumbs Container */}
            <div className="w-full max-w-7xl mx-auto px-4 mt-8 mb-6 flex justify-center">
                <CheckoutBreadcrumbs
                    currentStep="customize"
                    designId={router.query.designId as string}
                    serviceType="cloth_only"
                />
            </div>

            {/* Main Content */}
            <div className="max-w-md mx-auto px-4 pb-20 space-y-12">

                {/* Page Heading */}
                <div className="mb-14 mt-4 text-center">
                    <h1 className="text-3xl font-serif font-light text-[#1C1C1C] mb-4 tracking-wide">
                        Customize Fabric
                    </h1>
                    <p className="text-[#5A5751] text-[10px] uppercase tracking-[0.2em] font-medium">
                        Embroidery cloth only
                    </p>
                </div>

                {/* Selected Design Summary (Compact) */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-white rounded-none p-4 shadow-none flex items-center gap-4 border border-[#E8E6E0]"
                >
                    <div className="w-16 h-16 bg-[#F9F7F3] rounded-none flex-shrink-0 overflow-hidden relative">
                        <div className={`absolute inset-0 ${selectedDesign?.image || 'bg-gray-200'}`} />
                        {/* Placeholder overlay if no real image */}
                        {!selectedDesign?.image?.includes('url') && (
                            <div className="absolute inset-0 flex items-center justify-center text-[#999] text-[9px] uppercase tracking-widest text-center p-1">
                                Emb.
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-[#999] font-medium mb-1">SELECTED DESIGN</p>
                        <h3 className="font-serif text-lg text-[#1C1C1C] tracking-wide">{selectedDesign?.name || 'Unknown Design'}</h3>
                        <p className="text-[10px] text-[#5A5751] uppercase tracking-[0.1em] mt-0.5">{selectedDesign?.category || 'Collection'}</p>
                    </div>
                </motion.div>

                <motion.section
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1C1C1C]">
                            1. Choose Fabric
                        </h2>
                        {isStep1Complete && <Check size={14} className="text-[#C9A14A]" />}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {fabrics.length === 0 ? (
                            <p className="text-[10px] uppercase tracking-[0.1em] text-[#999] col-span-2 text-center py-4">No fabrics available.</p>
                        ) : fabrics.map((fabric) => (
                            <motion.div
                                key={fabric.id}
                                variants={cardVariants}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleFabricSelect(fabric.id)}
                                className={`
                                    relative p-4 rounded-none border cursor-pointer transition-all duration-300 bg-white
                                    ${selectedFabric === fabric.id ? 'border-[#C9A14A] shadow-[0_10px_30px_-10px_rgba(201,161,74,0.1)]' : 'border-[#E8E6E0] hover:border-[#C9A14A]/50'}
                                `}
                            >
                                {/* Fabric Texture Placeholder matches embroidery-garment-selection */}
                                <div
                                    className="h-24 w-full rounded-none mb-4 border border-[#1C1C1C]/5 relative overflow-hidden"
                                    style={{ backgroundColor: fabric.color }}
                                >
                                    {/* Texture overlay */}
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                                </div>

                                <h3 className="font-medium text-xs tracking-wide text-[#1C1C1C] uppercase">{fabric.name}</h3>
                                <p className="text-[10px] text-[#777] mt-1.5 line-clamp-2 leading-relaxed">{fabric.note}</p>
                                <p className="text-[11px] font-medium tracking-wide text-[#1C1C1C] mt-3">₹{fabric.price_per_meter}/m</p>

                                {/* Selection Indicators */}
                                {selectedFabric === fabric.id && (
                                    <div className="absolute top-3 right-3 text-[#C9A14A]">
                                        <Check size={14} strokeWidth={2} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                <motion.section
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className={`transition-opacity duration-500 ${!isStep1Complete ? 'opacity-40 pointer-events-none grayscale' : ''} `}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1C1C1C]">
                            2. Choose Color
                        </h2>
                        {isStep2Complete && <Check size={14} className="text-[#C9A14A]" />}
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                        {colors.length === 0 ? (
                            <p className="text-[10px] uppercase tracking-[0.1em] text-[#999] col-span-5 text-center py-4">No colors available.</p>
                        ) : colors.map((color) => (
                            <motion.button
                                key={color.id}
                                variants={cardVariants}
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
                </motion.section>


            </div>

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E6E0] p-4 pb-8 safe-area-pb z-50">
                <div className="max-w-md mx-auto flex items-center justify-between gap-6">
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-[#999] font-medium mb-1">Total Estimate</p>
                        <p className="font-serif text-2xl text-[#1C1C1C] tracking-wide">₹{totalPrice.toLocaleString()}</p>
                    </div>
                    <button
                        onClick={handleContinue}
                        disabled={!canContinue}
                        className={`
                            px-8 py-4 rounded-none font-medium text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-all duration-300
                            ${canContinue
                                ? 'bg-[#1C1C1C] text-white hover:bg-[#C9A14A] hover:shadow-[0_10px_30px_-10px_rgba(201,161,74,0.3)] border border-transparent hover:border-[#C9A14A]'
                                : 'bg-[#E8E6E0] text-[#999] cursor-not-allowed'
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
