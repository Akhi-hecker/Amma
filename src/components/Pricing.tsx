import React from 'react';
import { motion } from 'framer-motion';

const Pricing = () => {
    return (
        <section className="w-full py-32 md:py-40 bg-white relative overflow-hidden flex flex-col items-center justify-center text-center" id="pricing">
            <div className="container mx-auto px-4 md:px-6 max-w-3xl">

                {/* Content Wrapper */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#1C1C1C] mb-8 leading-tight">
                        Transparent, Fair <span className="text-[#C9A14A] italic">Pricing</span>
                    </h2>

                    <p className="text-[#555555] text-lg md:text-xl lg:text-2xl font-sans leading-relaxed max-w-2xl mx-auto mb-16">
                        Base price & embroidery & fabric upgrades included in final cost. You see total before checkout.
                    </p>

                    {/* Luxury Editorial Link CTA */}
                    <motion.button
                        whileHover="hover"
                        initial="initial"
                        className="group relative inline-flex cursor-pointer bg-transparent border-none p-0 focus:outline-none mx-auto"
                    >
                        <div className="relative flex flex-col items-center">
                            {/* Text and Arrow Container */}
                            <div className="flex items-center gap-3">
                                <span className="font-[var(--font-montserrat)] font-semibold uppercase tracking-[0.2em] text-[#C9A14A] text-lg md:text-xl">
                                    View Pricing
                                </span>
                                <motion.span
                                    variants={{
                                        initial: { x: 0 },
                                        hover: { x: 6 }
                                    }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="text-[#C9A14A] text-xl"
                                >
                                    →
                                </motion.span>
                            </div>

                            {/* Underline - strictly matching parent width */}
                            <motion.span
                                className="absolute -bottom-2 left-0 right-0 h-[1.5px] bg-[#C9A14A]"
                                variants={{
                                    initial: { opacity: 0.6 },
                                    hover: { opacity: 1 }
                                }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            />
                        </div>
                    </motion.button>
                </motion.div>

            </div>
        </section>
    );
};

export default Pricing;
