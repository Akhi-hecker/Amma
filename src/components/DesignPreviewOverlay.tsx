import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, AppWindow, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ... imports

// Update Interface (or import shared one, but for now matching local definition to data/designs.ts to be safe or just rely on prop)
import { Design } from '@/data/designs';

interface DesignPreviewOverlayProps {
    design: Design;
    onClose: () => void;
    onSelect: (design: Design) => void;
    wishlist: string[];
    toggleWishlist: (e: React.MouseEvent, id: string) => void;
}

export default function DesignPreviewOverlay({ design, onClose, onSelect, wishlist, toggleWishlist }: DesignPreviewOverlayProps) {
    const { protectAction } = useAuth();
    const [activeView, setActiveView] = useState(0);
    const isLiked = wishlist.includes(design.id);

    // Mock Thumbnails - In a real app, these would come from the design object or design_images table
    // For Phase 1, we use the single dynamic image mapped from category
    const views = [
        { id: 0, label: 'Full View', image: design.image },
        { id: 1, label: 'Close Up', image: design.image },
        { id: 2, label: 'Detailed', image: design.image },
        { id: 3, label: 'Fabric', image: design.image },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white w-full h-[100dvh] sm:h-auto sm:max-w-4xl sm:max-h-[85vh] sm:rounded-2xl shadow-2xl overflow-hidden relative flex flex-col sm:flex-row absolute bottom-0 sm:relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button - Floats on top for both mobile and desktop */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:right-auto sm:left-4 z-20 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full backdrop-blur-md transition-colors"
                >
                    <X size={24} />
                </button>

                {/* --- MOBILE LAYOUT (Vertical Scroll) --- */}
                <div className="flex-1 overflow-y-auto sm:hidden flex flex-col bg-white">
                    <div className="relative w-full">
                        {/* Image Stack - Horizontal Snap Carousel */}
                        <div
                            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar bg-white relative"
                            onScroll={(e) => {
                                const scrollLeft = e.currentTarget.scrollLeft;
                                const width = e.currentTarget.offsetWidth;
                                const index = Math.round(scrollLeft / width);
                                if (index !== activeView) {
                                    setActiveView(index);
                                }
                            }}
                        >
                            {views.map((view) => (
                                <div key={view.id} className="min-w-full snap-center relative">
                                    <ZoomableImage view={view} designCategory={design.category} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Info Section - Moved Inside Scroll */}
                    <div className="bg-white -mt-6 rounded-t-3xl relative z-10 px-6 pt-8 pb-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                        {/* Pagination Dots */}
                        <div className="flex justify-center gap-2 mb-6">
                            {views.map((view) => (
                                <div
                                    key={view.id}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${activeView === view.id
                                        ? 'bg-[#C9A14A] w-6'
                                        : 'bg-gray-200 w-1.5'
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="block text-[#C9A14A] text-xs font-bold uppercase tracking-widest mb-1">
                                        {design.category}
                                    </span>
                                    <h2 className="font-serif text-3xl text-[#1C1C1C] leading-tight">
                                        {design.name}
                                    </h2>
                                </div>
                                <button
                                    onClick={(e) => toggleWishlist(e, design.id)}
                                    className="p-2 -mr-2 text-[#1C1C1C]"
                                >
                                    <Heart
                                        size={22}
                                        className={`transition-colors ${isLiked ? 'fill-[#C9A14A] text-[#C9A14A]' : 'text-[#1C1C1C]'}`}
                                    />
                                </button>
                            </div>
                            <div className="h-1 w-12 bg-[#C9A14A]/30 mt-2"></div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4 mb-6">
                            <p className="text-[#555555] font-light leading-relaxed text-sm">
                                {design.descriptor}
                            </p>
                            <p className="text-[#555555] font-light leading-relaxed text-sm">
                                {design.long_description || `Experience the finest craftsmanship with our ${design.category.toLowerCase()} collection. Each stitch is placed with precision to ensure a premium finish that stands out.`}
                            </p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-[#F9F7F3] p-3 rounded-lg">
                                <span className="block text-[10px] uppercase text-[#999] tracking-wider mb-1">Fabric Suitability</span>
                                <span className="block text-sm text-[#1C1C1C] font-medium">{design.fabric_suitability || 'Universal'}</span>
                            </div>
                            <div className="bg-[#F9F7F3] p-3 rounded-lg">
                                <span className="block text-[10px] uppercase text-[#999] tracking-wider mb-1">Complexity</span>
                                <span className="block text-sm text-[#1C1C1C] font-medium">{design.complexity || 'Standard'}</span>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <button
                            onClick={() => onSelect(design)}
                            className="w-full bg-[#C9A14A] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-lg shadow-[#C9A14A]/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                        >
                            <span>Choose This Design</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* --- DESKTOP/TABLET LAYOUT (Side by Side) --- */}
                {/* Left Side: Visuals (Hero + Thumbnails) */}
                <div className="hidden sm:flex w-full sm:w-[55%] h-[50vh] sm:h-auto bg-[#F9F7F3] flex-col relative">
                    {/* Main Hero Image */}
                    <div className={`flex-grow w-full relative overflow-hidden ${design.image}`}>
                        {/* Visual Placeholder if using color classes */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <span className="font-serif text-6xl text-black">{design.category}</span>
                        </div>

                        {/* View Label Badge */}
                        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-sm shadow-sm">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#1C1C1C]">
                                {views[activeView].label}
                            </span>
                        </div>
                    </div>

                    {/* Thumbnails Strip */}
                    <div className="h-20 sm:h-24 bg-white border-t border-[#F0F0F0] flex items-center gap-2 px-4 overflow-x-auto no-scrollbar">
                        {views.map((view) => (
                            <button
                                key={view.id}
                                onClick={() => setActiveView(view.id)}
                                className={`
                                    relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden transition-all duration-200
                                    ${activeView === view.id ? 'ring-2 ring-[#C9A14A] ring-offset-2' : 'opacity-60 hover:opacity-100'}
                                    ${view.image}
                                `}
                            >
                                {/* Overlay to aid contrast for specific Tailwind colors in mock */}
                            </button>
                        ))}
                    </div>
                </div>



                {/* Right Side: Information & Action */}
                <div className="hidden sm:flex w-full sm:w-[45%] flex-col p-6 sm:p-10 bg-white">
                    <div className="flex-grow">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="block text-[#C9A14A] text-xs font-bold uppercase tracking-widest mb-2">
                                        {design.category}
                                    </span>
                                    <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1C1C] leading-tight mb-3">
                                        {design.name}
                                    </h2>
                                </div>
                                <button
                                    onClick={(e) => toggleWishlist(e, design.id)}
                                    className="p-3 hover:bg-gray-50 rounded-full transition-colors group"
                                >
                                    <Heart
                                        size={24}
                                        className={`transition-colors ${isLiked ? 'fill-[#C9A14A] text-[#C9A14A]' : 'text-[#999] group-hover:text-[#1C1C1C]'}`}
                                    />
                                </button>
                            </div>
                            <div className="h-1 w-12 bg-[#C9A14A]/30"></div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4 mb-8">
                            <p className="text-[#555555] font-light leading-relaxed text-sm sm:text-base">
                                {design.descriptor}
                            </p>
                            <p className="text-[#555555] font-light leading-relaxed text-sm sm:text-base">
                                {design.long_description || `Experience the finest craftsmanship with our ${design.category.toLowerCase()} collection. Each stitch is placed with precision to ensure a premium finish that stands out.`}
                            </p>
                        </div>

                        {/* Details Grid (Mock) */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-[#F9F7F3] p-3 rounded-lg">
                                <span className="block text-[10px] uppercase text-[#999] tracking-wider mb-1">Fabric Suitability</span>
                                <span className="block text-sm text-[#1C1C1C] font-medium">{design.fabric_suitability || 'Universal'}</span>
                            </div>
                            <div className="bg-[#F9F7F3] p-3 rounded-lg">
                                <span className="block text-[10px] uppercase text-[#999] tracking-wider mb-1">Complexity</span>
                                <span className="block text-sm text-[#1C1C1C] font-medium">{design.complexity || 'Standard'}</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA Area */}
                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <button
                            onClick={() => onSelect(design)}
                            className="w-full bg-[#C9A14A] hover:bg-[#b08d40] text-white py-4 px-6 rounded-lg
                                     flex items-center justify-center gap-3 transition-all duration-300
                                     shadow-[0_4px_14px_rgba(201,161,74,0.3)] hover:shadow-[0_6px_20px_rgba(201,161,74,0.4)]
                                     transform active:scale-[0.98]"
                        >
                            <span className="font-medium tracking-wide">Choose This Design</span>
                            <ArrowRight size={18} />
                        </button>
                        <p className="text-center mt-3 text-[10px] text-[#999999]">
                            Confirming will take you to service selection
                        </p>
                    </div>
                </div>

            </motion.div >
        </motion.div >
    );
}

// Sub-component for Zoom logic
function ZoomableImage({ view, designCategory }: { view: any, designCategory: string }) {
    const [isZoomed, setIsZoomed] = useState(false);

    return (
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#F9F7F3]">
            <motion.div
                className={`w-full h-full ${view.image}`}
                animate={{
                    scale: isZoomed ? 2 : 1,
                    x: isZoomed ? 0 : 0, // Reset position when zooming out
                    y: isZoomed ? 0 : 0
                }}
                transition={{ duration: 0.3 }}
                drag={isZoomed}
                dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                onTap={() => {
                    // Simple tap handler if needed
                }}
                onDoubleClick={() => setIsZoomed(!isZoomed)} // Doubke tap implies double click in some pointers, but touch needs separate handler?
                // Framer motion 'onTap' is single tap. Double tap needs custom logic or extensive gesture handlers.
                // For simplicity in this env, we simulate double tap via onClick with timeout or just use onDoubleClick which works on many mobile browsers too.
                // Better: generic toggle for now.
                onClick={(e) => {
                    // Simple toggle on click for "tap to zoom" if we want, or implement double tap logic.
                    // Requirement: "Double-tap to zoom".
                    // Creating custom double tap hook is verbose here, so we'll use a click handler with delayed check.
                    // Actually, framer motion doesn't have native onDoubleTap.
                    // Let's use a specialized handler.
                }}
            >
                {/* Placeholder content */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <span className="font-serif text-4xl text-black">{designCategory}</span>
                </div>

                {/* Double Tap Handler Wrapper */}
                <div
                    className="absolute inset-0"
                    onClick={(e) => {
                        // Rudimentary double tap
                        const now = Date.now();
                        const last = (e.currentTarget as any).lastClick || 0;
                        if (now - last < 300) {
                            setIsZoomed(!isZoomed);
                        }
                        (e.currentTarget as any).lastClick = now;
                    }}
                />
            </motion.div>

            {/* Label Overlay */}
            {!isZoomed && (
                <div className="absolute bottom-8 sm:bottom-3 left-3 bg-white/50 backdrop-blur-sm px-2 py-1 rounded text-[10px] uppercase font-semibold text-black/80 pointer-events-none">
                    {view.label}
                </div>
            )}
        </div>
    );
}
