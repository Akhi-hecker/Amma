import React from 'react';
import { motion } from 'framer-motion';
import { PenTool, Layers, Palette, ShoppingBag, Truck, ChevronRight } from 'lucide-react';

const STEPS = [
    { id: '01', title: 'Choose Design', icon: PenTool },
    { id: '02', title: 'Select Fabric', icon: Layers },
    { id: '03', title: 'Customize', icon: Palette },
    { id: '04', title: 'Order', icon: ShoppingBag },
    { id: '05', title: 'Delivery', icon: Truck },
];

const HowItWorks = () => {
    return (
        <section className="w-full py-20 md:py-32 bg-white relative">
            <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">

                <div className="text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-[#C9A14A] text-xs font-bold tracking-[0.25em] uppercase mb-4 block"
                    >
                        Process
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl md:text-5xl font-serif text-[#1C1C1C]"
                    >
                        Your Custom Outfit <br className="md:hidden" />
                        <span className="italic font-normal text-gray-400">in 5 simple steps</span>
                    </motion.h2>
                </div>

                {/* Steps Container */}
                <div className="flex flex-row justify-between items-start gap-2 md:gap-4 max-w-6xl mx-auto relative px-1">

                    {/* Horizontal Line for Desktop and Mobile (Adjusted top position) */}
                    <div className="absolute top-[1.5rem] md:top-[2.5rem] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E6E3DE] to-transparent z-0" />

                    {STEPS.map((step, idx) => (
                        <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 md:gap-4 w-full md:w-auto text-center group">

                            {/* Icon Circle */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-white border border-[#E6E3DE] flex items-center justify-center shrink-0 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] group-hover:border-[#C9A14A] group-hover:shadow-[0_10px_30px_-10px_rgba(201,161,74,0.3)] transition-all duration-500 relative z-10"
                            >
                                <step.icon strokeWidth={1.2} className="w-5 h-5 md:w-8 md:h-8 text-[#1C1C1C] group-hover:text-[#C9A14A] transition-colors duration-500" />

                                {/* Small Badge Number */}
                                <div className="absolute -top-1 -right-1 w-4 h-4 md:w-6 md:h-6 rounded-full bg-[#1C1C1C] text-white text-[8px] md:text-[10px] font-bold flex items-center justify-center border-2 border-white">
                                    {step.id}
                                </div>
                            </motion.div>

                            {/* Text */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 + 0.2 }}
                                className="flex-1 w-full"
                            >
                                <h3 className="text-[9px] md:text-lg font-serif text-[#1C1C1C] group-hover:text-[#C9A14A] transition-colors duration-300 leading-tight">
                                    {step.title}
                                </h3>
                            </motion.div>

                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default HowItWorks;
