import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    Check,
    Grid,
    Palette
} from 'lucide-react';
import { DESIGNS } from '@/data/designs';

// --- Mock Data for Colors ---
// Reusing/Expanding on previous color data
const COLORS = [
    { id: 'crimson', name: 'Crimson Red', hex: '#DC143C' },
    { id: 'emerald', name: 'Emerald Green', hex: '#50C878' },
    { id: 'midnight', name: 'Midnight Blue', hex: '#191970' },
    { id: 'black', name: 'Jet Black', hex: '#1A1A1A' },
    { id: 'ivory', name: 'Classic Ivory', hex: '#FFFFF0' },
    { id: 'gold', name: 'Royal Gold', hex: '#FFD700' },
    { id: 'burnt-orange', name: 'Burnt Orange', hex: '#CC5500' },
    { id: 'teal', name: 'Deep Teal', hex: '#008080' },
    { id: 'maroon', name: 'Deep Maroon', hex: '#800000' },
    { id: 'royal-blue', name: 'Royal Blue', hex: '#4169E1' },
    { id: 'mustard', name: 'Mustard Yellow', hex: '#FFDB58' },
    { id: 'blush', name: 'Blush Pink', hex: '#FFB6C1' },
];

export default function EmbroideryColorSelection() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const { designId, garment, fabricId } = router.query;

    // State
    const [selectedColor, setSelectedColor] = useState<string | null>(null);

    // Derived State
    const selectedDesign = DESIGNS.find(d => d.id === designId) || DESIGNS[0];
    const garmentDisplay = typeof garment === 'string'
        ? garment.charAt(0).toUpperCase() + garment.slice(1)
        : 'Garment';

    // Simple helper to format fabric ID to name
    const fabricDisplay = typeof fabricId === 'string'
        ? fabricId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        : 'Fabric';

    const selectedColorObj = COLORS.find(c => c.id === selectedColor);

    useEffect(() => {
        setMounted(true);
        if (router.query.colorId) {
            setSelectedColor(router.query.colorId as string);
        }
    }, [router.query]);

    if (!mounted) return null;

    const handleBack = () => {
        router.back();
    };

    const handleContinue = () => {
        if (!selectedColor) return;
        // Proceed to next step: Sizing & Measurements
        router.push({
            pathname: '/embroidery-sizing',
            query: { ...router.query, colorId: selectedColor }
        });
    };

    // --- Animation Variants ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.03
            }
        }
    };

    const swatchVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
    };

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-32 pt-[64px] md:pt-[68px] lg:pt-[72px]">
            <Head>
                <title>Choose Color | Amma Embroidery</title>
            </Head>

            {/* Main Content */}
            <div className="max-w-md mx-auto px-4 pt-2 space-y-8">

                {/* Page Heading */}
                <div className="text-center mb-4">
                    <h1 className="font-serif text-3xl text-[#1C1C1C] mb-2">
                        Choose Color
                    </h1>
                    <p className="text-sm font-medium text-[#C9A14A] min-h-[20px] transition-all duration-300">
                        {selectedColorObj ? `Selected: ${selectedColorObj.name}` : 'Select a shade that matches your style.'}
                    </p>
                </div>

                {/* Summary Card */}
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                            <Palette size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#999] font-medium leading-none mb-1">Context</p>
                        <h3 className="font-serif text-sm text-[#1C1C1C] leading-tight mb-0.5">
                            {selectedDesign?.name}
                        </h3>
                        <p className="text-xs text-[#555]">
                            {garmentDisplay} <span className="text-[#C9A14A] mx-1">•</span> {fabricDisplay}
                        </p>
                    </div>
                </div>

                {/* Color Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-4 gap-y-6 gap-x-4 justify-items-center"
                >
                    {COLORS.map((color) => {
                        const isSelected = selectedColor === color.id;

                        return (
                            <motion.button
                                key={color.id}
                                variants={swatchVariants}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSelectedColor(color.id)}
                                className={`
                                    w-14 h-14 rounded-full relative focus:outline-none transition-all duration-300 group
                                    ${isSelected
                                        ? 'ring-2 ring-offset-4 ring-[#C9A14A] scale-105 shadow-md'
                                        : 'hover:scale-105 shadow-sm'}
                                `}
                                style={{ backgroundColor: color.hex }}
                                aria-label={color.name}
                            >
                                {isSelected && (
                                    <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
                                        <Check size={20} strokeWidth={3} />
                                    </span>
                                )}
                            </motion.button>
                        );
                    })}
                </motion.div>

                {/* Helper Text */}
                <p className="text-xs text-[#999] text-center italic mt-8">
                    Actual fabric color may vary slightly due to screen settings and lighting.
                </p>

            </div>

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E8E6E0] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={handleContinue}
                        disabled={!selectedColor}
                        className={`
                            w-full py-4 rounded-xl font-medium text-base text-center transition-all duration-300
                            ${selectedColor
                                ? 'bg-[#C9A14A] text-white shadow-lg shadow-[#C9A14A]/30 hover:bg-[#B89240] active:scale-[0.99]'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                        `}
                    >
                        Continue
                    </button>
                </div>
            </div>

        </div>
    );
}
