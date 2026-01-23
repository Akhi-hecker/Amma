import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, ChevronRight, Ruler, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Design } from '@/data/designs';

// --- Interfaces ---
interface Fabric {
    id: string;
    name: string;
    description: string;
    price_per_meter: number;
    note?: string; // mapping description to note
    color?: string; // fallback or logic needed? We'll use a specific color mapping logic or default
}

interface FabricColor {
    id: string;
    name: string;
    hex_code: string;
}

interface FabricLength {
    id: string;
    label: string;
    length_meters: number;
}



export default function EmbroideryClothOnlyPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Data State
    const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
    const [fabrics, setFabrics] = useState<Fabric[]>([]);
    const [colors, setColors] = useState<FabricColor[]>([]);
    const [lengths, setLengths] = useState<FabricLength[]>([]);

    // Selection state
    const [selectedFabric, setSelectedFabric] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [lengthMode, setLengthMode] = useState<'preset' | 'custom'>('preset');
    const [selectedLength, setSelectedLength] = useState<number | null>(null); // Stores length value for preset
    const [customLength, setCustomLength] = useState<string>('');

    // Derived state
    const currentFabric = fabrics.find(f => f.id === selectedFabric);
    const currentColor = colors.find(c => c.id === selectedColor);

    // Fetch Data
    useEffect(() => {
        setMounted(true);
        if (!router.isReady) return;

        async function fetchData() {
            setIsLoading(true);
            try {
                const { designId } = router.query;

                // 1. Fetch Design
                if (designId) {
                    const { data: designData } = await supabase
                        .from('designs')
                        .select('*')
                        .eq('id', designId)
                        .single();

                    if (designData) {
                        // Minimal Mapping for UI
                        let imageColor = 'bg-gray-50';
                        // Simple mapping for visual placeholder
                        if (designData.category === 'Floral') imageColor = 'bg-rose-100';
                        else if (designData.category === 'Traditional') imageColor = 'bg-amber-100';
                        else imageColor = 'bg-slate-100';

                        const mappedDesign: Design = {
                            id: designData.id,
                            name: designData.title,
                            category: designData.category,
                            image: imageColor,
                            descriptor: designData.short_description || '',
                            long_description: designData.long_description,
                            fabric_suitability: designData.fabric_suitability,
                            complexity: designData.complexity,
                            base_price: Number(designData.base_price) || 1200,
                        };
                        setSelectedDesign(mappedDesign);
                    }
                }

                // 2. Fetch Fabrics
                const { data: fabricData } = await supabase
                    .from('fabrics')
                    .select('*')
                    .eq('is_active', true);

                if (fabricData) {
                    setFabrics(fabricData.map(f => ({
                        id: f.id,
                        name: f.name,
                        description: f.description,
                        // Ensure it's a number
                        price_per_meter: Number(f.price_per_meter) || 0,
                        note: f.description,
                        // Visual placeholder logic
                        color: f.name.toLowerCase().includes('silk') ? '#D8C8B0' : '#F0EAD6'
                    })));
                }

                // 3. Fetch Colors
                const { data: colorData } = await supabase
                    .from('fabric_colors')
                    .select('*')
                    .eq('is_active', true);

                if (colorData) {
                    setColors(colorData.map(c => ({
                        id: c.id,
                        name: c.name,
                        hex_code: c.hex_code || '#CCCCCC'
                    })));
                }

                // 4. Fetch Lengths
                const { data: lengthData } = await supabase
                    .from('fabric_lengths')
                    .select('*')
                    .eq('is_active', true)
                    .order('length_meters', { ascending: true });

                if (lengthData) {
                    setLengths(lengthData.map(l => ({
                        id: l.id,
                        label: l.label,
                        length_meters: Number(l.length_meters)
                    })));
                }

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
        const { fabricId, colorId, length } = router.query;
        if (fabricId) setSelectedFabric(fabricId as string);
        if (colorId) setSelectedColor(colorId as string);
        if (length) {
            const l = parseFloat(length as string);
            // Check if matches preset
            const preset = lengths.find(p => p.length_meters === l);
            if (preset) {
                setLengthMode('preset');
                setSelectedLength(l);
            } else {
                setLengthMode('custom');
                setCustomLength(length as string);
            }
        }
    }, [mounted, isLoading, router.query, lengths]);

    // Logic
    const currentLengthVal = lengthMode === 'preset' ? selectedLength : parseFloat(customLength);
    const validLength = currentLengthVal && currentLengthVal > 0 ? currentLengthVal : 0;

    // Price Calculation
    // Total = Design Base Price + (Fabric Price Per Meter * Length)
    const baseDesignPrice = selectedDesign?.base_price || 0;
    const fabricCost = currentFabric ? (Number(currentFabric.price_per_meter) * validLength) : 0;
    const totalPrice = baseDesignPrice + fabricCost;

    const isStep1Complete = !!selectedFabric;
    const isStep2Complete = !!selectedColor;
    const isStep3Complete = validLength > 0;
    const canContinue = isStep1Complete && isStep2Complete && isStep3Complete;

    const handleFabricSelect = (id: string) => setSelectedFabric(id);
    const handleColorSelect = (id: string) => setSelectedColor(id);
    const handleLengthPreset = (val: number) => {
        setLengthMode('preset');
        setSelectedLength(val);
    };
    const handleCustomLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLengthMode('custom');
        const val = e.target.value;
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
            setCustomLength(val);
            setSelectedLength(null);
        }
    };

    // --- Animation Variants ---
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    // --- Navigation ---
    const handleContinue = () => {
        if (!canContinue) return;

        // Find ID for preset length if applicable
        const selectedLengthObj = lengths.find(l => l.length_meters === selectedLength);
        const lengthId = lengthMode === 'preset' ? selectedLengthObj?.id : undefined;

        router.push({
            pathname: '/order-summary-embroidery',
            query: {
                designId: selectedDesign?.id,
                fabricId: selectedFabric,
                colorId: selectedColor,
                length: validLength,
                lengthId: lengthId, // Pass the ID
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

            <div className="max-w-md mx-auto px-4 py-6 space-y-10">

                {/* Page Header */}
                <div className="text-center pt-4">
                    <h1 className="font-serif text-3xl text-[#1C1C1C] mb-2">
                        Customize Fabric
                    </h1>
                    <p className="text-[#5A5751]">
                        Embroidery cloth only
                    </p>
                </div>

                {/* Selected Design Summary (Static) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-4 shadow-card flex items-center gap-4 border border-transparent"
                >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden relative">
                        <div className={`absolute inset-0 ${selectedDesign?.image || 'bg-gray-200'}`} />
                        {/* Placeholder overlay if no real image */}
                        {!selectedDesign?.image?.includes('url') && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500/50 text-xs text-center p-1">
                                Preview
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#999] font-medium mb-0.5">SELECTED DESIGN</p>
                        <h3 className="font-serif text-lg text-[#C9A14A]">{selectedDesign?.name || 'Unknown Design'}</h3>
                        <p className="text-sm text-[#5A5751]">{selectedDesign?.category || 'Collection'}</p>
                    </div>
                </motion.div>

                {/* Step 1: Choose Fabric */}
                <motion.section
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <div className="mb-4">
                        <div className="flex items-baseline justify-between mb-1">
                            <h2 className="font-serif text-xl">Choose Fabric</h2>
                            {isStep1Complete && <Check size={16} className="text-[#C9A14A]" />}
                        </div>
                        <p className="text-sm text-[#5A5751]">Select the base fabric for embroidery</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {fabrics.length === 0 ? (
                            <p className="text-sm text-gray-400 col-span-2 text-center py-4">No fabrics available.</p>
                        ) : fabrics.map((fabric) => (
                            <motion.div
                                key={fabric.id}
                                variants={fadeInUp}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleFabricSelect(fabric.id)}
                                className={`
                                    relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 bg-white
                                    ${selectedFabric === fabric.id
                                        ? 'border-[#C9A14A] shadow-soft'
                                        : 'border-transparent shadow-sm hover:border-gray-200'}
                                `}
                            >
                                <div
                                    className="h-20 w-full rounded-md mb-3"
                                    style={{ backgroundColor: fabric.color }}
                                />
                                <h3 className="font-medium text-sm text-[#1C1C1C]">{fabric.name}</h3>
                                <p className="text-xs text-[#777] mt-1 line-clamp-2">{fabric.note}</p>
                                <p className="text-xs font-semibold text-[#1C1C1C] mt-2">₹{fabric.price_per_meter}/m</p>

                                {selectedFabric === fabric.id && (
                                    <div className="absolute top-2 right-2 bg-[#C9A14A] text-white rounded-full p-0.5">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Step 2: Choose Color */}
                <motion.section
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className={!isStep1Complete ? 'opacity-50 pointer-events-none filter grayscale' : ''}
                >
                    <div className="mb-4">
                        <div className="flex items-baseline justify-between mb-1">
                            <h2 className="font-serif text-xl">Choose Color</h2>
                            {isStep2Complete && <Check size={16} className="text-[#C9A14A]" />}
                        </div>
                        <p className="text-sm text-[#5A5751]">
                            {currentColor ? `Selected: ${currentColor.name}` : 'Tap a color to select'}
                        </p>
                    </div>

                    <div className="grid grid-cols-4 gap-4 justify-items-center">
                        {colors.length === 0 ? (
                            <p className="text-sm text-gray-400 col-span-4 text-center py-4">No colors available.</p>
                        ) : colors.map((color) => (
                            <motion.button
                                key={color.id}
                                variants={fadeInUp}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleColorSelect(color.id)}
                                className={`
                                    w-14 h-14 rounded-full relative focus:outline-none transition-all duration-300
                                    ${selectedColor === color.id ? 'ring-2 ring-offset-2 ring-[#C9A14A] scale-105' : 'hover:scale-105'}
                                `}
                                style={{ backgroundColor: color.hex_code }}
                                aria-label={color.name}
                            >
                                {selectedColor === color.id && (
                                    <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
                                        <Check size={20} strokeWidth={3} />
                                    </span>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </motion.section>

                {/* Step 3: Select Length */}
                <motion.section
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className={!isStep2Complete ? 'opacity-50 pointer-events-none filter grayscale' : ''}
                >
                    <div className="mb-4">
                        <div className="flex items-baseline justify-between mb-1">
                            <h2 className="font-serif text-xl">Select Length</h2>
                            {isStep3Complete && <Check size={16} className="text-[#C9A14A]" />}
                        </div>
                        <p className="text-sm text-[#5A5751]">Length in meters</p>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-4">
                        {lengths.length === 0 ? (
                            <p className="text-sm text-gray-400 w-full text-center py-4">No length presets available.</p>
                        ) : lengths.map((preset) => (
                            <motion.button
                                key={preset.id}
                                variants={fadeInUp}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => handleLengthPreset(preset.length_meters)}
                                className={`
                                    px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
                                    ${lengthMode === 'preset' && selectedLength === preset.length_meters
                                        ? 'bg-[#1C1C1C] text-white border-[#1C1C1C] shadow-lg'
                                        : 'bg-white text-[#5A5751] border-gray-200 hover:border-[#C9A14A]'}
                                `}
                            >
                                {preset.label}
                            </motion.button>
                        ))}
                    </div>

                    {/* Custom Length Input */}
                    <motion.div variants={fadeInUp} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${lengthMode === 'custom' ? 'bg-[#F9F7F3] text-[#C9A14A]' : 'text-gray-400'}`}>
                                <Ruler size={20} />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-[#777] mb-1 block">Custom Length (meters)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="e.g. 3.5"
                                    value={customLength}
                                    onChange={handleCustomLengthChange}
                                    onFocus={() => {
                                        setLengthMode('custom');
                                        setSelectedLength(null);
                                    }}
                                    className={`
                                        w-full text-lg font-medium outline-none bg-transparent placeholder-gray-300
                                        ${lengthMode === 'custom' ? 'text-[#1C1C1C]' : 'text-gray-400'}
                                    `}
                                />
                            </div>
                            {lengthMode === 'custom' && (
                                <div className="text-sm font-medium text-[#C9A14A]">
                                    Selected
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.section>

            </div>

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E6E0] p-4 pb-8 safe-area-pb shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-md mx-auto flex flex-col gap-3">

                    {/* Price Row */}
                    <div className="flex justify-between items-end mb-1">
                        <div>
                            <p className="text-xs text-[#777] mb-0.5">Estimated Price</p>
                            <p className="text-[10px] text-[#999]">Final price confirmed later</p>
                        </div>
                        <div className="text-right">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={totalPrice}
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    className="block text-2xl font-serif text-[#1C1C1C]"
                                >
                                    ₹{totalPrice.toLocaleString()}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={handleContinue}
                        disabled={!canContinue}
                        className={`
                            w-full py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300
                            ${canContinue
                                ? 'bg-[#C9A14A] text-white shadow-lg shadow-[#C9A14A]/30 hover:bg-[#B89240] transform active:scale-[0.98]'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                        `}
                    >
                        <span>Continue</span>
                        <ChevronRight size={16} />
                    </button>

                </div>
            </div>
        </div>
    );
}
