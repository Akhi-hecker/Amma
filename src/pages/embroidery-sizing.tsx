import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Check,
    Ruler,
    Info,
    Grid,
    Palette,
    Scissors
} from 'lucide-react';
import { DESIGNS } from '@/data/designs';

// --- Mock Data ---
const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function EmbroiderySizing() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const { designId, garment, fabricId, colorId } = router.query;

    // State
    const [mode, setMode] = useState<'standard' | 'custom'>('standard');
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [measurements, setMeasurements] = useState({
        bust: '',
        waist: '',
        hip: '',
        shoulder: '',
        sleeveLength: '',
        garmentLength: '',
    });

    // Derived State
    const selectedDesign = DESIGNS.find(d => d.id === designId) || DESIGNS[0];
    const garmentDisplay = typeof garment === 'string'
        ? garment.charAt(0).toUpperCase() + garment.slice(1)
        : 'Garment';

    // Validation
    const isCustomValid = Object.values(measurements).every(val => val.trim() !== '' && !isNaN(Number(val)));
    const canContinue = mode === 'standard' ? !!selectedSize : isCustomValid;

    useEffect(() => {
        setMounted(true);
        // Pre-fill if revisiting (could be expanded)
    }, []);

    if (!mounted) return null;

    const handleBack = () => {
        router.back();
    };

    const handleContinue = () => {
        if (!canContinue) return;

        // Prepare data package
        const sizingData = mode === 'standard'
            ? { size: selectedSize, type: 'standard' }
            : { measurements, type: 'custom' };

        // For now, log or push to Order Review
        // Assuming '/order-review-embroidery' or similar
        // Or re-using order summary page with specialized mode?
        // 'order-summary-embroidery' seems to be the one.

        router.push({
            pathname: '/order-summary-embroidery',
            query: {
                ...router.query,
                sizeType: mode,
                sizeValue: mode === 'standard' ? selectedSize : JSON.stringify(measurements)
                // In real app, maybe store measurements in context/redux or pass individually
            }
        });
    };

    const handleMeasurementChange = (field: string, value: string) => {
        // Allow numeric and decimal
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setMeasurements(prev => ({ ...prev, [field]: value }));
        }
    };

    // --- Animation Variants ---
    const slideUp = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
    };

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-32 pt-[64px] md:pt-[68px] lg:pt-[72px]">
            <Head>
                <title>Size & Measurements | Amma Embroidery</title>
            </Head>

            {/* Main Content */}
            <div className="max-w-md mx-auto px-4 pt-2 space-y-8">

                {/* Page Heading */}
                <div className="text-center mb-4">
                    <h1 className="font-serif text-3xl text-[#1C1C1C] mb-2">
                        Select Size
                    </h1>
                    <p className="font-sans text-[#555555] text-sm">
                        Choose your standard size or provide custom measurements.
                    </p>
                </div>

                {/* Summary Card */}
                <div className="bg-white rounded-none p-4 shadow-none border border-[#E8E6E0] flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#F9F7F3] rounded-none border border-[#E8E6E0] flex-shrink-0 overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                            <Ruler size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#999] font-medium leading-none mb-1">Selections</p>
                        <h3 className="font-serif text-sm text-[#1C1C1C] leading-tight mb-0.5">
                            {selectedDesign?.name}
                        </h3>
                        <p className="text-xs text-[#555] line-clamp-1">
                            {garmentDisplay} <span className="text-[#C9A14A] mx-1">•</span> Fabric Ref: {fabricId || '...'} <span className="text-[#C9A14A] mx-1">•</span> Color Ref: {colorId || '...'}
                        </p>
                    </div>
                </div>

                {/* Mode Toggle */}
                <div>
                    <div className="flex bg-[#F9F7F3] p-1 rounded-none shadow-none border border-[#E8E6E0]">
                        {['standard', 'custom'].map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m as any)}
                                className={`
                                    flex-1 py-2.5 rounded-none text-[10px] tracking-widest uppercase font-bold transition-all duration-300
                                    ${mode === m
                                        ? 'bg-[#1C1C1C] text-white shadow-none'
                                        : 'text-[#555] hover:bg-white'}
                                `}
                            >
                                {m === 'standard' ? 'Standard Size' : 'Custom Measurements'}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {mode === 'standard' ? (
                        <motion.div
                            key="standard"
                            variants={slideUp}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-baseline px-1">
                                <h3 className="font-medium text-[#1C1C1C]">Select Standard Size</h3>
                                <button className="text-xs text-[#C9A14A] underline decoration-[#C9A14A]/40 underline-offset-4">Size Guide</button>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {STANDARD_SIZES.map((size) => {
                                    const isSelected = selectedSize === size;
                                    return (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`
                                                relative h-14 rounded-none border flex items-center justify-center font-bold text-xs uppercase tracking-widest transition-all duration-200
                                                ${isSelected
                                                    ? 'border-[#1C1C1C] bg-[#1C1C1C] text-white shadow-none'
                                                    : 'border-[#E8E6E0] bg-[#F9F7F3] text-[#555] hover:border-[#1C1C1C]/40'}
                                            `}
                                        >
                                            {size}
                                            {isSelected && (
                                                <div className="absolute top-1 right-1 text-white">
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex gap-3 p-4 bg-[#F9F7F3] rounded-none border border-[#E8E6E0]">
                                <Info size={16} className="text-[#1C1C1C] flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-[#555] leading-relaxed">Standard sizes are based on general body measurements. For a perfect fit, we recommend custom measurements.</p>
                            </div>

                        </motion.div>
                    ) : (
                        <motion.div
                            key="custom"
                            variants={slideUp}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-5"
                        >
                            <div className="flex justify-between items-baseline px-1">
                                <h3 className="font-medium text-[#1C1C1C]">Enter Custom Measurements</h3>
                                <button className="text-xs text-[#C9A14A] underline decoration-[#C9A14A]/40 underline-offset-4">How to Measure</button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {Object.keys(measurements).map((key) => (
                                    <div key={key} className="space-y-1">
                                        <label className="text-xs font-medium text-[#777] ml-1 uppercase tracking-wide">
                                            {key.replace(/([A-Z])/g, ' $1').trim()} (cm)
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={(measurements as any)[key]}
                                            onChange={(e) => handleMeasurementChange(key, e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-transparent border-b border-[#E8E6E0] h-12 px-0 text-[#1C1C1C] focus:border-[#1C1C1C] outline-none transition-all placeholder:text-[#999]"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 p-4 bg-[#F9F7F3] rounded-none border border-[#E8E6E0]">
                                <Scissors size={16} className="text-[#1C1C1C] flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-[#555] leading-relaxed">Our master tailors review every measurement to ensure your garment fits you perfectly.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E8E6E0] shadow-none z-50">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={handleContinue}
                        disabled={!canContinue}
                        className={`
                            w-full py-4 rounded-none font-bold text-[10px] tracking-widest uppercase text-center transition-all duration-300
                            ${canContinue
                                ? 'bg-[#1C1C1C] text-white shadow-none hover:bg-[#333] active:scale-[0.99]'
                                : 'bg-[#F0F0F0] text-[#999] cursor-not-allowed border border-[#E8E6E0]'}
                        `}
                    >
                        Continue
                    </button>
                </div>
            </div>

        </div>
    );
}
