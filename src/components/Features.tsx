import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Scissors, Spline, Layers } from 'lucide-react';

const FEATURES = [
    {
        icon: Scissors,
        title: 'Precision Cut',
        desc: 'Laser-guided accuracy',
        delay: 0.1
    },
    {
        icon: Spline,
        title: 'Premium Thread',
        desc: 'Vibrant & color-fast',
        delay: 0.2
    },
    {
        icon: Layers,
        title: 'Finest Fabric',
        desc: 'Hand-selected quality',
        delay: 0.3
    }
];

const Features = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

    return (
        <section className="w-full py-16 md:py-24 bg-[#111111] border-y border-white/5 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C9A14A] rounded-full opacity-[0.03] blur-[120px] pointer-events-none" />

            <div ref={ref} className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">

                {/* Header */}
                <div className="text-center mb-12 md:mb-20">
                    <span className="text-[#C9A14A] text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                        The Amma Standard
                    </span>
                    <h2 className="text-3xl md:text-4xl font-serif text-white">
                        Uncompromising <span className="italic text-[#C9A14A]">Quality</span>
                    </h2>
                </div>

                <div className="flex flex-row divide-x divide-white/10 border-t border-b border-white/10">
                    {FEATURES.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.8, delay: feature.delay, ease: "easeOut" }}
                            className="flex-1 py-6 md:py-8 px-2 md:px-4 flex flex-col items-center text-center group cursor-default"
                        >
                            {/* Animated Icon Container */}
                            <div className="mb-3 md:mb-6 relative">
                                <div className="absolute inset-0 bg-[#C9A14A]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <feature.icon
                                    strokeWidth={1}
                                    className="w-5 h-5 md:w-10 md:h-10 text-white group-hover:text-[#C9A14A] transition-colors duration-500 relative z-10 transform group-hover:scale-110 duration-500 ease-out"
                                />
                            </div>

                            <h3 className="text-xs md:text-2xl font-serif text-white mb-2 tracking-tight group-hover:tracking-wide transition-all duration-500">
                                {feature.title}
                            </h3>

                            <div className="hidden md:block h-px w-8 bg-[#C9A14A] my-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <p className="text-[10px] md:text-sm font-sans text-white/40 uppercase tracking-widest font-medium group-hover:text-white/60 transition-colors duration-500 line-clamp-2 md:line-clamp-none">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Features;
