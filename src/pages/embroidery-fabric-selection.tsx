import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    Check,
    Info,
    Grid
} from 'lucide-react';
import { DESIGNS } from '@/data/designs';

// --- Mock Data for Fabrics ---
const FABRICS = [
    {
        id: 'cotton-silk',
        name: 'Cotton Silk',
        pricePerMeter: 450,
        note: 'Best for structured garments',
        color: '#E8E0D5'
    },
    {
        id: 'raw-silk',
        name: 'Raw Silk',
        pricePerMeter: 600,
        note: 'Premium textured finish',
        color: '#D8C8B0'
    },
    {
        id: 'organza',
        name: 'Organza',
        pricePerMeter: 550,
        note: 'Soft drape, ideal for dresses',
        color: '#F0EAD6'
    },
    {
        id: 'velvet',
        name: 'Velvet',
        pricePerMeter: 800,
        note: 'Luxurious for heavy suits',
        color: '#3D0C02'
    },
    {
        id: 'crepe',
        name: 'Crepe',
        pricePerMeter: 500,
        note: 'Elegant fall, wrinkle-free',
        color: '#F5F5DC'
    },
    {
        id: 'georgette',
        name: 'Georgette',
        pricePerMeter: 480,
        note: 'Lightweight and graceful',
        color: '#FFF8DC'
    }
];

export default function EmbroideryFabricSelection() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const { designId, garment } = router.query;

    // State
    const [selectedFabric, setSelectedFabric] = useState<string | null>(null);

    // Derived State
    const selectedDesign = DESIGNS.find(d => d.id === designId) || DESIGNS[0];
    const garmentDisplay = typeof garment === 'string'
        ? garment.charAt(0).toUpperCase() + garment.slice(1)
        : 'Selected Garment';

    useEffect(() => {
        setMounted(true);
        if (router.query.fabricId) {
            setSelectedFabric(router.query.fabricId as string);
        }
    }, [router.query]);

    if (!mounted) return null;

    const handleBack = () => {
        router.back();
    };

    const handleContinue = () => {
        if (!selectedFabric) return;
        // Proceed to next step: Color Selection
        router.push({
            pathname: '/embroidery-color-selection',
            query: { ...router.query, fabricId: selectedFabric }
        });
    };

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

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-32 pt-[64px] md:pt-[68px] lg:pt-[72px]">
            <Head>
                <title>Choose Fabric | Amma Embroidery</title>
            </Head>

            {/* Main Content */}
            <div className="max-w-md mx-auto px-4 pt-2 space-y-6">

                {/* Page Heading */}
                <div className="text-center mb-4">
                    <h1 className="font-serif text-3xl text-[#1C1C1C] mb-2">
                        Choose Fabric
                    </h1>
                    <p className="font-sans text-[#555555] text-sm">
                        All fabrics listed are suitable for embroidery and stitching.
                    </p>
                </div>

                {/* Summary Card */}
                <div className="bg-white rounded-none p-4 shadow-none border border-[#E8E6E0] flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#F9F7F3] rounded-none border border-[#E8E6E0] flex-shrink-0 overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center text-[#1C1C1C]">
                            <Grid size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#999] font-medium leading-none mb-1">Selected Context</p>
                        <h3 className="font-serif text-base text-[#1C1C1C] leading-tight">
                            {selectedDesign?.name} <span className="text-[#C9A14A] mx-1">•</span> {garmentDisplay}
                        </h3>
                    </div>
                </div>

                {/* Fabric Options Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 gap-3"
                >
                    {FABRICS.map((fabric) => {
                        const isSelected = selectedFabric === fabric.id;

                        return (
                            <motion.div
                                key={fabric.id}
                                variants={cardVariants}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedFabric(fabric.id)}
                                className={`
                                    relative flex flex-col p-4 rounded-none border-[1.5px] cursor-pointer transition-all duration-200 bg-white
                                    ${isSelected
                                        ? 'border-[#1C1C1C] shadow-none'
                                        : 'border-[#E8E6E0] shadow-none hover:border-[#1C1C1C]/40'}
                                `}
                            >
                                {/* Fabric Texture Placeholder */}
                                <div
                                    className="aspect-square w-full rounded-none mb-4 shadow-none border border-[#E8E6E0]"
                                    style={{ backgroundColor: fabric.color }}
                                />

                                <h3 className="text-sm font-semibold text-[#1C1C1C] mb-0.5">{fabric.name}</h3>
                                <p className="text-[11px] text-[#777] leading-snug line-clamp-2">{fabric.note}</p>
                                <p className="text-xs font-serif text-[#1C1C1C] mt-2 font-bold">₹{fabric.pricePerMeter}/m</p>

                                {/* Selection Indicators */}
                                {isSelected && (
                                    <div className="absolute top-3 right-3 flex items-center justify-center text-[#1C1C1C]">
                                        <Check size={16} strokeWidth={2.5} />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Subtle Helper */}
                <div className="flex items-start gap-3 p-4 rounded-none bg-[#F9F7F3] border border-[#E8E6E0] mt-4">
                    <Info size={16} className="text-[#1C1C1C] mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-[#888] italic">
                        Fabric suitability varies slightly by garment choice. Our experts personally review every selection.
                    </p>
                </div>

            </div>

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E8E6E0] shadow-none z-50">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={handleContinue}
                        disabled={!selectedFabric}
                        className={`
                            w-full py-4 rounded-none font-bold text-[10px] tracking-widest uppercase text-center transition-all duration-300
                            ${selectedFabric
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
