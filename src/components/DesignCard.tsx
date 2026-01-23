
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
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
        // Threshold of 10px for scroll detection
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
            setIsPressed(false);
        }
    };

    const handleTouchEnd = () => {
        // Smooth release
        setTimeout(() => setIsPressed(false), 150);
    };

    return (
        <motion.div
            layout
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
                exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
            }}
            initial="hidden"
            animate={{
                opacity: 1, y: 0,
                scale: isPressed ? 0.98 : 1,
            }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className="group relative cursor-pointer"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={onCardClick}
        >
            <div className={`
                bg-white rounded-lg overflow-hidden transition-all duration-300 border border-[#F0F0F0] h-full flex flex-col
                ${isPressed ? 'shadow-sm' : 'shadow-sm hover:shadow-xl'}
            `}>
                {/* Image Area - Aspect Ratio 5:6 */}
                <div className={`w-full aspect-[5/6] relative overflow-hidden ${design.image}`}>
                    {/* Top Overlay Badges & Actions */}
                    <div className="absolute top-3 left-3 z-10">
                        {design.badge && (
                            <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-sm text-[10px] md:text-xs font-semibold uppercase tracking-wide text-[#C9A14A] shadow-sm">
                                {design.badge}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={(e) => toggleWishlist(e, design.id)}
                        className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all active:scale-95"
                    >
                        <Heart
                            size={18}
                            className={`transition-colors duration-300 ${wishlist.includes(design.id) ? 'fill-[#C9A14A] text-[#C9A14A]' : 'text-[#1C1C1C]'}`}
                        />
                    </button>

                    {/* Placeholder Content */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:scale-105 transition-transform duration-700 ease-in-out">
                        <span className="font-serif text-2xl md:text-3xl italic text-[#1C1C1C]">{design.category}</span>
                    </div>

                    {/* Subtle Gold Overlay */}
                    <div className="absolute inset-0 bg-[#C9A14A]/0 group-hover:bg-[#C9A14A]/5 transition-colors duration-300" />
                </div>

                {/* Content Area */}
                <div className="p-2.5 sm:p-4 flex-grow flex flex-col justify-start">
                    <div className="mb-0.5">
                        <h3 className="font-serif text-sm sm:text-lg text-[#1C1C1C] md:group-hover:text-[#C9A14A] transition-colors duration-200 ease-out line-clamp-1 leading-tight">
                            {design.name}
                        </h3>
                    </div>
                    <p className="text-[9px] sm:text-[10px] uppercase text-[#999999] font-medium tracking-wider mb-1">
                        {design.category}
                    </p>
                    <p className="font-sans text-[10px] sm:text-xs text-[#666666] line-clamp-1 leading-relaxed">
                        {design.descriptor}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

