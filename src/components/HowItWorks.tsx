import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PenTool, Layers, Palette, ShoppingBag, Truck } from 'lucide-react';

const STEPS = [
    {
        id: '01',
        icon: PenTool,
        title: 'Choose a Design',
        description: 'Browse our exclusive collection or upload your own concept.',
    },
    {
        id: '02',
        icon: Layers,
        title: 'Pick Fabric',
        description: 'Select from refined cottons, linens, and silks that last.',
    },
    {
        id: '03',
        icon: Palette,
        title: 'Select Color',
        description: 'Match the perfect thread shade to your unique style.',
    },
    {
        id: '04',
        icon: ShoppingBag,
        title: 'Place Order',
        description: 'Secure checkout with precise customization details.',
    },
    {
        id: '05',
        icon: Truck,
        title: "We Deliver",
        description: 'Your custom masterpiece arrives at your doorstep, ready to wear.',
    },
];

const HowItWorks = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    // The "Golden Thread" height animation
    const settingsHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <section ref={containerRef} className="w-full py-24 md:py-32 bg-[#F9F7F3] relative overflow-hidden">
            <div className="container mx-auto px-6 md:px-12 max-w-6xl relative z-10">

                {/* Header */}
                <div className="text-center mb-20 md:mb-32">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-4xl md:text-6xl font-serif text-[#1C1C1C] mb-6"
                    >
                        Your Custom Outfit <br /> <span className="text-[#C9A14A] italic">in 5 Simple Steps</span>
                    </motion.h2>
                </div>

                {/* Timeline Container */}
                <div className="relative">
                    {/* The Static Vertical Line Base */}
                    <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-[1px] bg-[#C9A14A]/20 transform md:-translate-x-1/2" />

                    {/* The Animated "Golden Thread" */}
                    <motion.div
                        style={{ height: settingsHeight }}
                        className="absolute left-[19px] md:left-1/2 top-0 w-[2px] bg-gradient-to-b from-[#C9A14A] via-[#E8C47A] to-[#C9A14A] transform md:-translate-x-1/2 origin-top"
                    />

                    <div className="space-y-12 md:space-y-24">
                        {STEPS.map((step, idx) => {
                            const isEven = idx % 2 === 1;
                            return (
                                <TimelineItem key={step.id} step={step} index={idx} isEven={isEven} />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Ambient Background Blur for Texture */}
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#C9A14A]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#C9A14A]/5 rounded-full blur-3xl pointer-events-none" />
        </section>
    );
};

const TimelineItem = ({ step, index, isEven }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, delay: index * 0.1, ease: "easeOut" }}
            className={`relative flex items-start md:items-center ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'}`}
        >
            {/* Timeline Dot */}
            <div className="absolute left-0 md:left-1/2 w-10 h-10 flex items-center justify-center transform md:-translate-x-1/2 z-10 bg-[#F9F7F3]">
                <div className="w-3 h-3 bg-[#C9A14A] rounded-full ring-4 ring-[#F9F7F3] shadow-[0_0_0_1px_rgba(201,161,74,0.4)]" />
            </div>

            {/* Content Side */}
            <div className={`ml-16 md:ml-0 md:w-1/2 ${isEven ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'}`}>
                <div className={`flex flex-col ${isEven ? 'md:items-end' : 'md:items-start'}`}>
                    <span className="text-6xl md:text-7xl font-serif text-[#C9A14A]/40 font-bold leading-none mb-4 block">
                        {step.id}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-serif text-[#1C1C1C] mb-2">
                        {step.title}
                    </h3>
                    <p className="text-[#555555] font-sans text-lg leading-relaxed max-w-sm">
                        {step.description}
                    </p>
                </div>
            </div>

            {/* Spacer for structure */}
            <div className="hidden md:block md:w-1/2" />

            {/* Desktop Icon - Beside the Golden Dot */}
            <div className={`absolute top-0 md:top-1/2 transform md:-translate-y-1/2 
                ${isEven ? 'md:right-[calc(50%+4rem)]' : 'md:left-[calc(50%+4rem)]'} 
                hidden md:flex items-center justify-center w-14 h-14 rounded-full bg-white border border-[#C9A14A]/30 text-[#C9A14A] shadow-sm z-10
             `}>
                <step.icon strokeWidth={1.2} className="w-7 h-7" />
            </div>
        </motion.div>
    )
}

export default HowItWorks;
