import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, Variants } from 'framer-motion';
import { Scissors, Shirt, Truck, Ruler, Sparkles, Star, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import CheckoutBreadcrumbs from '@/components/CheckoutBreadcrumbs';

export default function ServiceSelection() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const { designId } = router.query;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || isLoading) return null;

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    return (
        <>
            <Head>
                <title>Choose Service Type | Amma Embroidery</title>
                <meta name="description" content="Select how you want your embroidery service fulfilled." />
            </Head>

            <div className="min-h-screen bg-[#F9F7F3] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-7xl mx-auto mb-8 flex flex-col items-center">
                    <div className="mb-6 w-full flex justify-center">
                        <CheckoutBreadcrumbs
                            currentStep="service"
                            designId={designId as string}
                        />
                    </div>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-0 mt-4"
                    >
                        <h1 className="font-serif text-4xl font-light text-[#1C1C1C] mb-4 tracking-wide">
                            Choose Your Service
                        </h1>
                        <p className="text-[#5A5751] text-[10px] uppercase tracking-[0.2em] font-medium leading-relaxed mb-1 max-w-sm mx-auto">
                            How should we handle your fabric?
                        </p>
                        <p className="text-[#999] text-[9px] uppercase tracking-[0.1em] font-medium max-w-sm mx-auto">
                            No rush. You can change this later.
                        </p>
                    </motion.div>
                </div>

                <div className="max-w-md mx-auto">

                    {/* Cards Container */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-5"
                    >
                        {/* Card 1: Embroidery Cloth Only */}
                        <motion.div variants={cardVariants}>
                            <div className="bg-white rounded-none p-8 border border-[#E8E6E0] relative overflow-hidden transition-all duration-300 group hover:border-[#C9A14A] shadow-none">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="font-serif text-2xl font-light text-[#1C1C1C] tracking-wide pr-4">
                                        Embroidery Cloth Only
                                    </h2>
                                    <div className="text-[#1C1C1C]/40 flex-shrink-0 group-hover:text-[#C9A14A] transition-colors">
                                        <Scissors size={24} strokeWidth={1.5} />
                                    </div>
                                </div>

                                <p className="text-[#777] text-xs font-light tracking-wide mb-8 leading-relaxed">
                                    We provide embroidered fabric. You stitch it yourself.
                                </p>

                                <div className="flex flex-wrap gap-3 mb-10">
                                    <div className="inline-flex items-center px-3 py-1.5 border border-[#E8E6E0] text-[9px] text-[#1C1C1C] uppercase tracking-[0.2em] font-medium gap-2">
                                        <Check size={12} strokeWidth={1.5} />
                                        Fabric Included
                                    </div>
                                </div>

                                <Link
                                    href={designId ? `/embroidery-cloth-only?designId=${designId}` : '/embroidery-cloth-only'}
                                    className="block outline-none"
                                >
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-4 bg-[#1C1C1C] text-white font-medium text-[11px] tracking-[0.2em] uppercase rounded-none transition-all duration-300 hover:bg-[#C9A14A] hover:border-[#C9A14A] hover:shadow-[0_10px_30px_-10px_rgba(201,161,74,0.3)] border border-[#1C1C1C]"
                                    >
                                        Select Cloth Only
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Card 2: Full Product (Most Popular) */}
                        <motion.div variants={cardVariants}>
                            <div className="bg-white rounded-none p-8 border border-[#C9A14A] relative overflow-hidden transition-all duration-300 group shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_30px_-10px_rgba(201,161,74,0.2)]">
                                {/* Most Popular Badge */}
                                <div className="absolute top-0 right-0 bg-[#C9A14A] text-white text-[9px] font-medium px-4 py-2 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Star size={10} fill="currentColor" strokeWidth={0} />
                                    MOST POPULAR
                                </div>

                                <div className="flex justify-between items-start mb-6 mt-4">
                                    <h2 className="font-serif text-2xl font-light text-[#1C1C1C] tracking-wide pr-4">
                                        Embroidery & Stitching
                                    </h2>
                                    <div className="text-[#1C1C1C]/40 flex-shrink-0 group-hover:text-[#C9A14A] transition-colors">
                                        <Shirt size={24} strokeWidth={1.5} />
                                    </div>
                                </div>

                                <p className="text-[#777] text-xs font-light tracking-wide mb-8 leading-relaxed">
                                    We deliver a fully stitched, ready-to-wear product.
                                </p>

                                <div className="flex flex-wrap gap-3 mb-10">
                                    <div className="inline-flex items-center px-3 py-1.5 border border-[#1C1C1C]/10 text-[9px] text-[#1C1C1C] uppercase tracking-[0.2em] font-medium gap-2 bg-[#F9F7F3]">
                                        <Ruler size={12} strokeWidth={1.5} />
                                        Custom Size
                                    </div>
                                    <div className="inline-flex items-center px-3 py-1.5 border border-[#1C1C1C]/10 text-[9px] text-[#1C1C1C] uppercase tracking-[0.2em] font-medium gap-2 bg-[#F9F7F3]">
                                        <Sparkles size={12} strokeWidth={1.5} />
                                        Premium Finish
                                    </div>
                                </div>

                                <Link
                                    href={designId ? `/embroidery-garment-selection?designId=${designId}` : '/embroidery-garment-selection'}
                                    className="block outline-none"
                                >
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-4 bg-[#C9A14A] text-white font-medium text-[11px] tracking-[0.2em] uppercase rounded-none transition-all duration-300 hover:bg-black hover:border-black hover:shadow-[0_10px_30px_-10px_rgba(201,161,74,0.3)] border border-[#C9A14A]"
                                    >
                                        Customize Product
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Card 3: Send Your Fabric */}
                        <motion.div variants={cardVariants}>
                            <div className="bg-white rounded-none p-8 border border-[#E8E6E0] relative overflow-hidden transition-all duration-300 group hover:border-[#C9A14A] shadow-none">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="font-serif text-2xl font-light text-[#1C1C1C] tracking-wide pr-4">
                                        Send Your Fabric
                                    </h2>
                                    <div className="text-[#1C1C1C]/40 flex-shrink-0 group-hover:text-[#C9A14A] transition-colors">
                                        <Truck size={24} strokeWidth={1.5} />
                                    </div>
                                </div>

                                <p className="text-[#777] text-xs font-light tracking-wide mb-8 leading-relaxed">
                                    We’ll arrange pickup and handle your fabric personally.
                                </p>

                                <div className="flex flex-wrap gap-3 mb-10">
                                    <div className="inline-flex items-center px-3 py-1.5 border border-[#E8E6E0] text-[9px] text-[#1C1C1C] uppercase tracking-[0.2em] font-medium gap-2">
                                        <Truck size={12} strokeWidth={1.5} />
                                        We Pickup
                                    </div>
                                </div>

                                <Link
                                    href={designId ? `/send-your-fabric?designId=${designId}` : '/send-your-fabric'}
                                    className="block outline-none"
                                >
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-4 bg-transparent border border-[#E8E6E0] text-[#1C1C1C] font-medium text-[11px] tracking-[0.2em] uppercase rounded-none transition-all duration-300 hover:border-[#C9A14A] hover:text-[#C9A14A] hover:bg-white"
                                    >
                                        Contact for Pickup
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
