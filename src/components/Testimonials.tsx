
import React from 'react';
import { motion } from 'framer-motion';

const TESTIMONIALS = [
    {
        name: "Priya Sharma",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
        quote: "The embroidery detail is absolutely stunning. It felt like wearing a piece of art."
    },
    {
        name: "Arjun Mehta",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        quote: "Seamless process from design to delivery. The fabric quality exceeded my expectations."
    },
    {
        name: "Ananya Gupta",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
        quote: "I’ve never had a suit fit this perfectly. The custom measurements were spot on!"
    }
];

const Testimonials = () => {
    return (
        <section className="w-full py-24 md:py-32 bg-[#F9F7F3] overflow-hidden relative">
            <div className="container mx-auto px-6 md:px-12 max-w-6xl">

                {/* Header */}
                <div className="text-center mb-16 md:mb-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl font-serif text-[#1C1C1C] mb-4"
                    >
                        Loved by Our <span className="text-[#C9A14A] italic">Customers</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl font-sans text-[#555555]"
                    >
                        Real embroidery. Real stories.
                    </motion.p>
                </div>

                {/* Cards Container */}
                <div className="flex flex-col md:flex-row gap-8 md:gap-8 justify-center items-stretch">
                    {TESTIMONIALS.map((t, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: 100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{
                                duration: 0.8,
                                delay: idx * 0.2,
                                ease: [0.215, 0.61, 0.355, 1.0] // Soft easing (cubic-bezier)
                            }}
                            className="flex-1 bg-white p-8 md:p-10 rounded-2xl shadow-soft flex flex-col items-center text-center hover:shadow-card transition-shadow duration-300 transform"
                        >
                            {/* User Photo */}
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-6 border-[3px] border-[#F9F7F3] shadow-sm relative shrink-0">
                                <img
                                    src={t.image}
                                    alt={t.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>

                            {/* Quote */}
                            <p className="font-sans text-[16px] text-[#1C1C1C] leading-relaxed mb-6 opacity-90 italic">
                                "{t.quote}"
                            </p>

                            {/* Name */}
                            <h4 className="font-serif text-[18px] text-[#1C1C1C] mt-auto font-medium">
                                {t.name}
                            </h4>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Testimonials;
