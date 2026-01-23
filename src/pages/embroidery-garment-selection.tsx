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
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Design } from '@/data/designs';

// --- Interfaces ---
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
    'Kurta': Shirt,
    'Lehenga': Umbrella,
    'Other': MoreHorizontal,
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
                    const { data: designData } = await supabase
                        .from('designs')
                        .select('*')
                        .eq('id', designId)
                        .single();

                    if (designData) {
                        let imageColor = 'bg-gray-50';
                        switch (designData.category) {
                            case 'Floral': imageColor = 'bg-rose-100'; break;
                            case 'Traditional': imageColor = 'bg-amber-100'; break;
                            case 'Modern': imageColor = 'bg-slate-100'; break;
                            default: imageColor = 'bg-gray-50';
                        }

                        setSelectedDesign({
                            id: designData.id,
                            name: designData.title,
                            category: designData.category,
                            image: imageColor,
                            descriptor: designData.short_description,
                            // base_price might be used as fallback
                            base_price: Number(designData.base_price) || 1200,
                            complexity: designData.complexity
                        });
                    }
                }

                // 2. Fetch Garment Types
                const { data: garments } = await supabase
                    .from('garment_types')
                    .select('*')
                    .eq('is_active', true);
                if (garments) {
                    setGarmentTypes(garments.map(g => ({
                        ...g,
                        base_stitching_price: Number(g.base_stitching_price),
                        default_fabric_consumption: Number(g.default_fabric_consumption)
                    })));
                }

                // 3. Fetch Fabrics
                const { data: fabricData } = await supabase
                    .from('fabrics')
                    .select('*')
                    .eq('is_active', true);
                if (fabricData) {
                    setFabrics(fabricData.map(f => ({
                        id: f.id,
                        name: f.name,
                        description: f.description,
                        price_per_meter: Number(f.price_per_meter) || 0,
                        color: f.name.toLowerCase().includes('silk') ? '#D8C8B0' : '#F0EAD6'
                    })));
                }

                // 4. Fetch Colors
                const { data: colorData } = await supabase
                    .from('fabric_colors')
                    .select('*')
                    .eq('is_active', true);
                if (colorData) setColors(colorData);

                // 5. Fetch Standard Sizes
                const { data: sizeData } = await supabase
                    .from('standard_sizes')
                    .select('*')
                    .eq('is_active', true)
                    .order('label');
                if (sizeData) {
                    setStandardSizes(sizeData.map(s => ({
                        ...s,
                        extra_price: Number(s.extra_price)
                    })));
                }

                // 6. Fetch Embroidery Pricing
                const { data: pricingData } = await supabase
                    .from('embroidery_pricing')
                    .select('*');
                if (pricingData) {
                    setEmbroideryPricing(pricingData.map(p => ({
                        complexity: p.complexity,
                        price: Number(p.price)
                    })));
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [router.isReady, router.query]);


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

    const handleAddToBag = async () => {
        if (!canAddToBag || !selectedDesign) return;
        setIsLoading(true);

        try {
            // Get User
            const storedUser = localStorage.getItem('amma_user');
            const user = storedUser ? JSON.parse(storedUser) : null;

            // Prepare Data for order_drafts
            const draftData: any = {
                user_id: user?.id || null,
                service_type: 'embroidery_stitching',
                design_id: selectedDesign.id,
                garment_type_id: selectedGarment,
                fabric_id: selectedFabric,
                color_id: selectedColor,
                standard_size_id: sizeMode === 'standard' ? selectedStandardSize : null,
                custom_measurements: sizeMode === 'custom' ? customMeasurements : null,
                estimated_price: priceBreakdown.total,
                quantity: 1,
                status: 'draft',
            };

            // Insert into Supabase
            const { error } = await supabase
                .from('order_drafts')
                .insert(draftData);

            if (error) throw error;

            window.dispatchEvent(new Event('bagUpdated')); // Optional: keep for legacy listeners
            alert("Added to Bag!");
            router.push('/shopping-bag');

        } catch (err) {
            console.error("Error adding to bag:", err);
            alert("Failed to add to bag. Please try again.");
        } finally {
            setIsLoading(false);
        }
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

            <div className="max-w-md mx-auto px-4 py-8 space-y-12">

                {/* Header */}
                <div className="text-center pt-2">
                    <h1 className="font-serif text-3xl text-[#1C1C1C] mb-2">
                        Customize Product
                    </h1>
                    <p className="text-[#5A5751]">
                        Embroidery & Stitching Service
                    </p>
                </div>

                {/* Step 1: Design Details */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 border border-gray-100"
                >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden relative">
                        <div className={`absolute inset-0 ${selectedDesign?.image || 'bg-gray-200'}`} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#999] font-medium mb-0.5">SELECTED DESIGN</p>
                        <h3 className="font-serif text-lg text-[#C9A14A]">{selectedDesign?.name}</h3>
                        <p className="text-sm text-[#5A5751]">{selectedDesign?.category}</p>
                    </div>
                </motion.div>

                {/* Step 2: Garment Selection */}
                <section>
                    <div className="flex items-baseline justify-between mb-4">
                        <h2 className="font-serif text-xl">1. Choose Garment</h2>
                        {isStep1Complete && <Check size={18} className="text-[#C9A14A]" />}
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
                                        relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 bg-white
                                        ${isSelected ? 'border-[#C9A14A] bg-[#C9A14A]/5 shadow-sm' : 'border-transparent shadow-sm hover:border-gray-200'}
                                    `}
                                >
                                    <div className={`mb-3 p-3 rounded-full ${isSelected ? 'bg-[#C9A14A]/10 text-[#C9A14A]' : 'bg-[#F9F7F3] text-[#777]'} `}>
                                        <Icon size={24} strokeWidth={1.5} />
                                    </div>
                                    <span className={`text-sm font-medium ${isSelected ? 'text-[#1C1C1C]' : 'text-[#555]'} `}>
                                        {type.name}
                                    </span>
                                    <span className="text-xs text-[#999] mt-1">
                                        ₹{type.base_stitching_price}
                                    </span>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 bg-[#C9A14A] text-white rounded-full p-0.5">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </section>

                {/* Step 3: Fabric Selection */}
                <section className={`transition-opacity duration-500 ${!isStep1Complete ? 'opacity-40 pointer-events-none grayscale' : ''} `}>
                    <div className="flex items-baseline justify-between mb-4">
                        <h2 className="font-serif text-xl">2. Choose Fabric</h2>
                        {isStep2Complete && <Check size={18} className="text-[#C9A14A]" />}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {fabrics.map((fabric) => (
                            <motion.div
                                key={fabric.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleFabricSelect(fabric.id)}
                                className={`
                                    relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 bg-white
                                    ${selectedFabric === fabric.id ? 'border-[#C9A14A] shadow-md ring-1 ring-[#C9A14A]/20' : 'border-transparent shadow-sm hover:border-gray-200'}
                                `}
                            >
                                <div
                                    className="h-24 w-full rounded-md mb-3 border border-black/5 relative overflow-hidden"
                                    style={{
                                        backgroundColor: fabric.color,
                                    }}
                                >
                                    {/* Texture overlay */}
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                                </div>

                                <h3 className="font-medium text-sm text-[#1C1C1C]">{fabric.name}</h3>
                                <p className="text-xs text-[#777] mt-1 line-clamp-2">{fabric.description}</p>
                                <p className="text-xs font-serif text-[#C9A14A] mt-2">₹{fabric.price_per_meter}/m</p>
                                {selectedFabric === fabric.id && (
                                    <div className="absolute top-2 right-2 bg-[#C9A14A] text-white rounded-full p-0.5">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Step 4: Color Selection */}
                <section className={`transition-opacity duration-500 ${!isStep2Complete ? 'opacity-40 pointer-events-none grayscale' : ''} `}>
                    <div className="flex items-baseline justify-between mb-4">
                        <h2 className="font-serif text-xl">3. Choose Color</h2>
                        {isStep3Complete && <Check size={18} className="text-[#C9A14A]" />}
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                        {colors.map((color) => (
                            <motion.button
                                key={color.id}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleColorSelect(color.id)}
                                className={`
                                    aspect-square rounded-full relative focus:outline-none transition-all duration-300 shadow-sm
                                    ${selectedColor === color.id ? 'ring-2 ring-offset-2 ring-[#C9A14A] scale-105 shadow-md' : 'hover:scale-110 hover:shadow-md'}
                                `}
                                style={{ backgroundColor: color.hex_code }}
                                aria-label={color.name}
                            >
                                {selectedColor === color.id && (
                                    <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
                                        <Check size={16} strokeWidth={3} />
                                    </span>
                                )}
                            </motion.button>
                        ))}
                    </div>
                    <div className="h-6 mt-3 text-center">
                        {selectedColor && (
                            <span className="text-xs text-[#777] font-medium animate-pulse">
                                {colors.find(c => c.id === selectedColor)?.name}
                            </span>
                        )}
                    </div>
                </section>

                {/* Step 5: Size & Measurements */}
                <section className={`transition-opacity duration-500 ${!isStep3Complete ? 'opacity-40 pointer-events-none grayscale' : ''} `}>
                    <div className="flex items-baseline justify-between mb-4">
                        <h2 className="font-serif text-xl">4. Size & Fit</h2>
                        {isStep4Complete && <Check size={18} className="text-[#C9A14A]" />}
                    </div>

                    <div className="flex bg-white p-1 rounded-xl border border-gray-200 mb-6 w-fit mx-auto shadow-sm">
                        <button
                            onClick={() => setSizeMode('standard')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sizeMode === 'standard' ? 'bg-[#1C1C1C] text-white shadow-md' : 'text-[#777] hover:bg-gray-50'
                                } `}
                        >
                            Standard Size
                        </button>
                        <button
                            onClick={() => setSizeMode('custom')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sizeMode === 'custom' ? 'bg-[#1C1C1C] text-white shadow-md' : 'text-[#777] hover:bg-gray-50'
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
                                        py-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center justify-center
                                        ${selectedStandardSize === size.id
                                            ? 'border-[#C9A14A] bg-[#C9A14A]/5 text-[#C9A14A] shadow-sm'
                                            : 'border-gray-200 bg-white text-[#555] hover:border-gray-300 hover:shadow-sm'
                                        }
                                    `}
                                >
                                    <span>{size.label}</span>
                                    {size.extra_price > 0 && (
                                        <span className="text-[10px] text-[#999]">+₹{size.extra_price}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {sizeMode === 'custom' && (
                        <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 shadow-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-[#777] mb-1 block">Chest (in)</label>
                                    <input type="number" value={customMeasurements.chest} onChange={(e) => handleCustomChange('chest', e.target.value)} className="w-full p-2 bg-[#F9F7F3] rounded-lg border-none focus:ring-1 focus:ring-[#C9A14A] outline-none text-sm" placeholder="32" />
                                </div>
                                <div>
                                    <label className="text-xs text-[#777] mb-1 block">Waist (in)</label>
                                    <input type="number" value={customMeasurements.waist} onChange={(e) => handleCustomChange('waist', e.target.value)} className="w-full p-2 bg-[#F9F7F3] rounded-lg border-none focus:ring-1 focus:ring-[#C9A14A] outline-none text-sm" placeholder="28" />
                                </div>
                                <div>
                                    <label className="text-xs text-[#777] mb-1 block">Hips (in)</label>
                                    <input type="number" value={customMeasurements.hips} onChange={(e) => handleCustomChange('hips', e.target.value)} className="w-full p-2 bg-[#F9F7F3] rounded-lg border-none focus:ring-1 focus:ring-[#C9A14A] outline-none text-sm" placeholder="36" />
                                </div>
                                <div>
                                    <label className="text-xs text-[#777] mb-1 block">Length (in)</label>
                                    <input type="number" value={customMeasurements.length} onChange={(e) => handleCustomChange('length', e.target.value)} className="w-full p-2 bg-[#F9F7F3] rounded-lg border-none focus:ring-1 focus:ring-[#C9A14A] outline-none text-sm" placeholder="40" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-[#777] mb-1 block">Notes</label>
                                <textarea value={customMeasurements.notes} onChange={(e) => handleCustomChange('notes', e.target.value)} rows={3} className="w-full p-2 bg-[#F9F7F3] rounded-lg border-none focus:ring-1 focus:ring-[#C9A14A] outline-none text-sm" placeholder="Any specific requirements..." />
                            </div>
                        </div>
                    )}
                </section>

                {/* Price Summary Breakdown */}
                {selectedGarment && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-3"
                    >
                        <h3 className="font-serif text-lg text-[#1C1C1C] mb-2 border-b border-gray-100 pb-2">Estimated Price</h3>

                        <div className="flex justify-between text-sm text-[#555]">
                            <span>Embroidery Design ({selectedDesign?.complexity || 'Standard'})</span>
                            <span>₹{priceBreakdown.embroideryCost.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-sm text-[#555]">
                            <span>Stitching Service</span>
                            <span>₹{priceBreakdown.stitchingCost.toFixed(2)}</span>
                        </div>

                        {priceBreakdown.fabricCost > 0 && (
                            <div className="flex justify-between text-sm text-[#555]">
                                <span>Fabric Cost ({garmentTypes.find(g => g.id === selectedGarment)?.default_fabric_consumption}m)</span>
                                <span>₹{priceBreakdown.fabricCost.toFixed(2)}</span>
                            </div>
                        )}

                        {priceBreakdown.sizeExtra > 0 && (
                            <div className="flex justify-between text-sm text-[#555]">
                                <span>Size Adjustment</span>
                                <span>₹{priceBreakdown.sizeExtra.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex justify-between font-serif text-lg text-[#C9A14A] pt-2 border-t border-gray-100 mt-2">
                            <span>Total Estimate</span>
                            <span>₹{priceBreakdown.total.toFixed(2)}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 italic mt-1">
                            *Final price may vary slightly based on specific customization requests.
                        </p>
                    </motion.div>
                )}

            </div>

            {/* Sticky Bottom Bar - Enhanced with Glassmorphism */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[#E8E6E0] p-4 pb-8 safe-area-pb shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50 transition-all">
                <div className="max-w-md mx-auto flex items-center gap-4">
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-0.5">Total Estimate</p>
                        <p className="font-serif text-xl text-[#1C1C1C]">₹{priceBreakdown.total.toFixed(2)}</p>
                    </div>
                    <button
                        onClick={handleAddToBag}
                        disabled={!canAddToBag}
                        className={`
                            flex-1 py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300
                            ${canAddToBag
                                ? 'bg-[#C9A14A] text-white shadow-lg shadow-[#C9A14A]/30 hover:bg-[#B89240] transform active:scale-[0.98]'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }
                        `}
                    >
                        <span>Add to Bag</span>
                        <ShoppingBag size={18} />
                    </button>
                </div>
            </div>

        </div>
    );
}
