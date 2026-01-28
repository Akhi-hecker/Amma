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
                        className="text-center mb-0"
                    >
                        <h1 className="font-serif text-3xl text-[#1C1C1C] mb-2">
                            Choose Your Service
                        </h1>
                        <p className="font-sans text-[#555555] text-lg mb-1">
                            How should we handle your fabric?
                        </p>
                        <p className="font-sans text-[#888888] text-sm">
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
                            <div className="bg-white rounded-xl shadow-card p-5 border border-transparent relative overflow-hidden md:hover:shadow-soft md:hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="font-serif text-xl text-[#1C1C1C] tracking-wide pr-4">
                                        Embroidery Cloth Only
                                    </h2>
                                    <div className="bg-[#F9F7F3] p-2.5 rounded-full text-[#C9A14A] flex-shrink-0">
                                        <Scissors size={20} strokeWidth={1.5} />
                                    </div>
                                </div>

                                <p className="font-sans text-[#777777] text-sm mb-5 leading-relaxed">
                                    We provide embroidered fabric. You stitch it yourself.
                                </p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F5F5F0] text-xs text-[#666666] font-medium gap-1.5">
                                        <Check size={12} />
                                        Fabric Included
                                    </div>
                                </div>

                                <Link
                                    href={designId ? `/embroidery-cloth-only?designId=${designId}` : '/embroidery-cloth-only'}
                                    className="block outline-none"
                                >
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-2.5 rounded-lg bg-[#C9A14A] text-white font-medium text-sm text-center shadow-sm hover:bg-[#B89240] hover:shadow-md transition-all duration-300"
                                    >
                                        Select Cloth Only
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Card 2: Full Product (Most Popular) */}
                        <motion.div variants={cardVariants}>
                            <div className="bg-white rounded-xl shadow-card p-5 border border-transparent relative overflow-hidden ring-1 ring-[#C9A14A]/10 md:hover:shadow-soft md:hover:-translate-y-1 transition-all duration-300">
                                {/* Most Popular Badge */}
                                <div className="absolute top-0 left-0 bg-[#2A2A2A] text-white text-[10px] font-medium px-3 py-1 rounded-br-lg tracking-wide flex items-center gap-1">
                                    <Star size={10} fill="currentColor" strokeWidth={0} />
                                    MOST POPULAR
                                </div>

                                <div className="flex justify-between items-start mb-4 mt-3">
                                    <h2 className="font-serif text-xl text-[#1C1C1C] tracking-wide pr-4">
                                        Embroidery & Stitching
                                    </h2>
                                    <div className="bg-[#F9F7F3] p-2.5 rounded-full text-[#C9A14A] flex-shrink-0">
                                        <Shirt size={20} strokeWidth={1.5} />
                                    </div>
                                </div>

                                <p className="font-sans text-[#777777] text-sm mb-5 leading-relaxed">
                                    We deliver a fully stitched, ready-to-wear product.
                                </p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F5F5F0] text-xs text-[#666666] font-medium gap-1.5">
                                        <Ruler size={12} />
                                        Custom Size
                                    </div>
                                    <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F5F5F0] text-xs text-[#666666] font-medium gap-1.5">
                                        <Sparkles size={12} />
                                        Premium Finish
                                    </div>
                                </div>

                                <Link
                                    href={designId ? `/embroidery-garment-selection?designId=${designId}` : '/embroidery-garment-selection'}
                                    className="block outline-none"
                                >
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-2.5 rounded-lg bg-[#C9A14A] text-white font-medium text-sm text-center shadow-sm hover:bg-[#B89240] hover:shadow-md transition-all duration-300"
                                    >
                                        Customize Product
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Card 3: Send Your Fabric */}
                        <motion.div variants={cardVariants}>
                            <div className="bg-white rounded-xl shadow-card p-5 border border-transparent relative overflow-hidden md:hover:shadow-soft md:hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="font-serif text-xl text-[#1C1C1C] tracking-wide pr-4">
                                        Send Your Fabric
                                    </h2>
                                    <div className="bg-[#F9F7F3] p-2.5 rounded-full text-[#C9A14A] flex-shrink-0">
                                        <Truck size={20} strokeWidth={1.5} />
                                    </div>
                                </div>

                                <p className="font-sans text-[#777777] text-sm mb-5 leading-relaxed">
                                    We’ll arrange pickup and handle your fabric personally.
                                </p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F5F5F0] text-xs text-[#666666] font-medium gap-1.5">
                                        <Truck size={12} />
                                        We Pickup
                                    </div>
                                </div>

                                <Link
                                    href={designId ? `/send-your-fabric?designId=${designId}` : '/send-your-fabric'}
                                    className="block outline-none"
                                >
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-2.5 rounded-lg border border-[#C9A14A] text-[#C9A14A] font-medium text-sm text-center transition-all duration-300 hover:bg-[#C9A14A]/5 hover:shadow-sm"
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
