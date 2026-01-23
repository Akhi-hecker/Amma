import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Scissors, Spline, Layers, Crosshair } from 'lucide-react';

const FEATURES = [
    {
        icon: Crosshair,
        title: 'Precision Stitching',
        highlight: 'Precision',
        description: 'Our high-precision machines place every stitch with sub-millimeter accuracy for flawless, intricate designs.',
        bg: 'bg-[#F9F7F3]',
        image: '/feature-precision.png',
    },
    {
        icon: Layers,
        title: 'Premium Fabrics',
        highlight: 'Premium',
        description: 'We source only the finest fabrics that provide the perfect stable canvas for high-density embroidery.',
        bg: 'bg-[#F9F7F3]',
        image: '/feature-fabric.png',
    },
    {
        icon: Spline,
        title: 'Finest Threads',
        highlight: 'Finest',
        description: 'Using high-tensile, color-fast threads ensures your custom design remains vibrant and durable for years.',
        bg: 'bg-[#F9F7F3]',
        image: '/feature-threads.png',
    },
    {
        icon: Scissors,
        title: 'Master Tailoring',
        highlight: 'Master',
        description: 'Each garment is cut and finished by expert tailors, ensuring the embroidery sits perfectly on the body.',
        bg: 'bg-[#F9F7F3]',
        image: '/feature-finishing.png',
    },
];

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

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: 'easeOut',
        },
    },
};

const iconVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.4, ease: "backOut" }
    }
};

const Features = () => {
    return (
        <section className="w-full py-24 md:py-32 bg-white relative">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="inline-block relative mb-6"
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#1C1C1C] leading-tight relative z-10">
                            Why Our Embroidery is <span className="text-[#C9A14A] italic">Different</span>
                        </h2>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                        className="text-[#555555] text-lg md:text-xl font-sans leading-relaxed max-w-2xl mx-auto"
                    >
                        We use high-precision machines, premium fabrics, and careful finishing to create custom embroidered fashion that feels unique and exquisite.
                    </motion.p>
                </div>

                {/* Feature Cards Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 !overflow-visible"
                >
                    {FEATURES.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            style={{ top: `${6 + idx * 2}rem` }}
                            className={`group overflow-hidden rounded-2xl ${feature.bg} shadow-sm hover:shadow-xl transition-all duration-500 border border-black/5 hover:-translate-y-2 sticky md:relative md:!top-auto`}
                        >
                            {/* Top Image Area */}
                            <div className="h-48 w-full relative overflow-hidden">
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-[#C9A14A]/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            {/* Content */}
                            <div className="p-8 relative">

                                {/* Icon Badge - Floating slightly over edge or just structured? Design says inside. */}
                                <div className="-mt-14 mb-5 relative z-10">
                                    <motion.div
                                        variants={iconVariants}
                                        className="w-16 h-16 rounded-full bg-[#C9A14A] flex items-center justify-center shadow-lg mx-auto md:mx-0 border-4 border-white"
                                    >
                                        <feature.icon strokeWidth={1.5} className="w-8 h-8 text-white" />
                                    </motion.div>
                                </div>

                                {/* Headline */}
                                <h3 className="font-serif text-2xl text-[#1C1C1C] mb-3 leading-tight">
                                    {feature.title.split(' ').map((word, i) => (
                                        word === feature.highlight ? <span key={i} className="text-[#C9A14A]">{word} </span> : <span key={i}>{word} </span>
                                    ))}
                                </h3>

                                {/* Body Text */}
                                <p className="font-sans text-base text-[#555555] leading-relaxed opacity-90">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Features;
