import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import { Design } from '@/data/designs';

interface DesignCardProps {
    design: Design;
    wishlist: string[];
    toggleWishlist: (e: React.MouseEvent, id: string) => void;
    onCardClick: () => void;
}

export default function DesignCard({
    design,
    wishlist,
    toggleWishlist,
    onCardClick
}: DesignCardProps) {
    const [isPressed, setIsPressed] = useState(false);
    const startRef = useRef({ x: 0, y: 0 });

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsPressed(true);
        startRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isPressed) return;
        const dx = e.touches[0].clientX - startRef.current.x;
        const dy = e.touches[0].clientY - startRef.current.y;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
            setIsPressed(false);
        }
    };

    const handleTouchEnd = () => {
        setTimeout(() => setIsPressed(false), 150);
    };

    return (
        <motion.div
            layout
            whileHover={{ y: -8 }}
            className="group relative cursor-pointer h-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={onCardClick}
        >
            <div className={`
                relative bg-white rounded-xl overflow-hidden transition-all duration-500 h-full flex flex-col border border-[#1C1C1C]/10
                ${isPressed ? 'scale-[0.98]' : ''}
                shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]
            `}>
                {/* Image Area - Aspect Ratio 4:5 for more portrait elegance */}
                <div className={`w-full aspect-[4/5] relative overflow-hidden ${design.image}`}>

                    {/* Badge */}
                    {design.badge && (
                        <div className="absolute top-4 left-4 z-10">
                            <span className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-sm text-[10px] tracking-[0.1em] font-bold uppercase text-[#1C1C1C] shadow-sm">
                                {design.badge}
                            </span>
                        </div>
                    )}

                    {/* Like Button */}
                    <button
                        onClick={(e) => toggleWishlist(e, design.id)}
                        className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-[#C9A14A] transition-all duration-300"
                    >
                        <Heart
                            size={16}
                            fill={wishlist.includes(design.id) ? "currentColor" : "none"}
                            strokeWidth={2}
                            className={wishlist.includes(design.id) ? 'text-[#C9A14A]' : ''}
                        />
                    </button>

                    {/* Image Hover Zoom */}
                    <div className="absolute inset-0 bg-[#000]/0 group-hover:bg-[#000]/5 transition-colors duration-500" />

                    {/* Placeholder Content (if no image) */}
                    {!design.image?.includes('url') && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-20 transition-opacity duration-700">
                            <span className="font-serif text-4xl italic text-[#1C1C1C]">Amma</span>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="p-5 flex-grow flex flex-col justify-between bg-white">
                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-serif text-lg text-[#1C1C1C] leading-snug group-hover:text-[#C9A14A] transition-colors duration-300">
                                {design.name}
                            </h3>
                        </div>
                        <p className="text-[10px] uppercase text-[#999999] font-bold tracking-widest mb-2">
                            {design.category}
                        </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#F0F0F0] pt-3 mt-2">
                        <span className="text-xs font-sans text-[#555555] font-medium">
                            {design.base_price ? `From ₹${design.base_price}` : (design.fabric_suitability || 'Customizable')}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <Star size={14} fill="#C9A14A" className="text-[#C9A14A]" />
                            <span className="text-xs font-serif font-bold text-[#1C1C1C] mt-0.5">4.9</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div >
    );
}
