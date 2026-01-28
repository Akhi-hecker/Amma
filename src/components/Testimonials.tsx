
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
    {
        id: 1,
        text: "The embroidery detail is absolutely stunning. It felt like wearing a piece of art tailored just for me.",
        highlight: "just for me.",
        author: "Priya Sharma",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop"
    },
    {
        id: 2,
        text: "I was amazed by the precision and quality. The fabric selection process was seamless and the result was perfect.",
        highlight: "perfect.",
        author: "Anjali Gupta",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
    },
    {
        id: 3,
        text: "Amma brought my vision to life. The traditional motifs with a modern twist were exactly what I was looking for.",
        highlight: "vision to life.",
        author: "Sneha Reddy",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
    },
    {
        id: 4,
        text: "Exceptional service and craftsmanship. Every stitch tells a story of dedication and skill.",
        highlight: "dedication.",
        author: "Mira Kapoor",
        image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop"
    }
];

const Testimonials = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="w-full py-24 bg-[#1C1C1C] text-white relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C9A14A] rounded-full opacity-[0.03] blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#C9A14A] rounded-full opacity-[0.02] blur-[80px] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center gap-6"
                    >
                        {/* Stars */}
                        <div className="flex gap-1.5 text-[#C9A14A]">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                            ))}
                        </div>

                        {/* Content */}
                        <div className="relative pt-8 pb-4 min-h-[200px] flex items-center justify-center">
                            <Quote className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 text-[#C9A14A]/20" />
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif leading-relaxed text-white/90">
                                "{TESTIMONIALS[currentIndex].text.replace(TESTIMONIALS[currentIndex].highlight, '')}
                                <span className="text-[#C9A14A] italic">{TESTIMONIALS[currentIndex].highlight}</span>"
                            </h2>
                        </div>

                        {/* Author */}
                        <div className="flex flex-col items-center gap-2 mt-4">
                            <div className="w-12 h-12 rounded-full border border-white/10 p-0.5 mb-1">
                                <img
                                    src={TESTIMONIALS[currentIndex].image}
                                    alt={TESTIMONIALS[currentIndex].author}
                                    className="w-full h-full rounded-full object-cover grayscale opacity-80"
                                />
                            </div>
                            <div className="text-sm font-sans text-white/60 font-medium tracking-wide uppercase">
                                {TESTIMONIALS[currentIndex].author}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Dots */}
                <div className="flex justify-center gap-3 mt-12">
                    {TESTIMONIALS.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-[#C9A14A]' : 'w-1.5 bg-white/20 hover:bg-white/40'
                                }`}
                            aria-label={`Go to testimonial ${index + 1}`}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Testimonials;
