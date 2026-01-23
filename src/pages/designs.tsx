import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router'; // Changed from Link import
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight, Heart, Filter, Grid, Bookmark } from 'lucide-react';
import DesignPreviewOverlay from '../components/DesignPreviewOverlay';
import DesignCard from '../components/DesignCard';
import { useAuth } from '@/context/AuthContext';

// --- Mock Data ---
import { Design } from '@/data/designs';

// Updated Style Shortcuts - Primary Filter
const STYLE_SHORTCUTS = [
    { id: '0', label: 'All', color: 'bg-gray-50' },
    { id: '1', label: 'Bridal', color: 'bg-red-50' },
    { id: '2', label: 'Floral', color: 'bg-pink-50' },
    { id: '3', label: 'Border', color: 'bg-amber-50' },
    { id: '4', label: 'Minimal', color: 'bg-slate-50' },
    { id: '5', label: 'Heavy', color: 'bg-purple-50' },
    { id: '6', label: 'Festive', color: 'bg-yellow-50' },
];

export default function DesignsGallery() {
    const router = useRouter();
    const { protectAction, isAuthenticated } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [mounted, setMounted] = useState(false);
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('styles'); // For utility bar: 'filter', 'styles', 'saved'
    const [shouldAnimate, setShouldAnimate] = useState(true);
    const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);

    const [designs, setDesigns] = useState<Design[]>([]);
    const [loading, setLoading] = useState(true);

    // Derived State for filtering
    const filteredDesigns = selectedCategory === 'All'
        ? designs
        : designs.filter((d) => d.category === selectedCategory);

    useEffect(() => {
        async function fetchDesigns() {
            try {
                // Dynamic import to avoid SSR issues if env not set, though client side fetch is fine
                const { supabase } = await import('../lib/supabaseClient');

                const { data, error } = await supabase
                    .from('designs')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching designs:', error);
                    return;
                }

                if (data) {
                    const mappedDesigns: Design[] = data.map((item: any) => {
                        // Helper to assign color based on category (preserving existing visual style)
                        let imageColor = 'bg-gray-50';
                        switch (item.category) {
                            case 'Floral': imageColor = 'bg-rose-100'; break;
                            case 'Traditional': imageColor = 'bg-amber-100'; break;
                            case 'Modern': imageColor = 'bg-slate-100'; break;
                            case 'Bridal': imageColor = 'bg-red-50'; break;
                            case 'Minimal': imageColor = 'bg-green-50'; break;
                            case 'Festive': imageColor = 'bg-yellow-50'; break;
                            case 'Border': imageColor = 'bg-orange-50'; break;
                            case 'Heavy': imageColor = 'bg-purple-100'; break;
                            default: imageColor = 'bg-gray-50';
                        }

                        return {
                            id: item.id,
                            name: item.title,
                            category: item.category,
                            image: imageColor, // Keeping the color block logic for now as requested
                            descriptor: item.short_description || '',
                            long_description: item.long_description,
                            fabric_suitability: item.fabric_suitability,
                            complexity: item.complexity,
                            // Optional: Map other fields if needed or derive 'badge'
                        };
                    });
                    setDesigns(mappedDesigns);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchDesigns();
    }, []);

    const handleSelectDesign = useCallback((design: Design) => {
        router.push({
            pathname: '/service-selection',
            query: { designId: design.id },
        });
    }, [router]);

    const handleStyleClick = (styleLabel: string) => {
        // If clicking 'All', strictly set to 'All'
        if (styleLabel === 'All') {
            setSelectedCategory('All');
            return;
        }

        // If clicking active style, revert to 'All' (toggle behavior)
        if (selectedCategory === styleLabel) {
            setSelectedCategory('All');
        } else {
            setSelectedCategory(styleLabel);
        }
    };

    // Fetch Wishlist from Supabase
    useEffect(() => {
        const fetchWishlist = async () => {
            if (!isAuthenticated) return;

            // Dynamic import to avoid SSR issues if used broadly, though context handles auth
            const { supabase } = await import('../lib/supabaseClient');

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('saved_designs')
                .select('design_id')
                .eq('user_id', user.id);

            if (data) {
                setWishlist(data.map((item: any) => item.design_id));
            }
        };

        fetchWishlist();
    }, [isAuthenticated]);

    const toggleWishlist = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();

        protectAction(async () => {
            // Optimistic Update
            const isLiked = wishlist.includes(id);
            const prevWishlist = [...wishlist];
            const newWishlist = isLiked
                ? wishlist.filter((itemId) => itemId !== id)
                : [...wishlist, id];

            setWishlist(newWishlist);

            try {
                const { supabase } = await import('../lib/supabaseClient');
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("User not found");

                if (isLiked) {
                    // Unlike
                    const { error } = await supabase
                        .from('saved_designs')
                        .delete()
                        .match({ user_id: user.id, design_id: id });

                    if (error) throw error;
                    // alert("Removed from saved designs"); // Optional feedback
                } else {
                    // Like
                    const { error } = await supabase
                        .from('saved_designs')
                        .insert({ user_id: user.id, design_id: id });

                    if (error) throw error;
                    alert("Saved to your designs");
                }
            } catch (err) {
                console.error("Wishlist sync failed", err);
                setWishlist(prevWishlist); // Revert
                alert("Failed to update wishlist. Please try again.");
            }
        }, { action: 'wishlist', designId: id });
    };

    const handleCardClick = (design: Design) => {
        // Save scroll position before opening overlay
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('designs_category', selectedCategory);
            sessionStorage.setItem('designs_scroll_pos', window.scrollY.toString());
        }
        setSelectedDesign(design);
    };

    useEffect(() => {
        // Restore State logic
        const savedCat = sessionStorage.getItem('designs_category');
        const savedScroll = sessionStorage.getItem('designs_scroll_pos');

        // Restore Wishlist
        const savedWishlist = localStorage.getItem('user_wishlist');
        if (savedWishlist) {
            try {
                setWishlist(JSON.parse(savedWishlist));
            } catch (e) {
                console.error("Failed to parse wishlist", e);
            }
        }

        if (savedCat) {
            setSelectedCategory(savedCat);
        }

        if (savedScroll) {
            setShouldAnimate(false);
            // Delay scroll slightly to ensure React has rendered the filtered list
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedScroll));
            }, 0);
        }

        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;

        const storedRedirect = sessionStorage.getItem('auth_redirect');
        if (storedRedirect) {
            try {
                const { action, designId } = JSON.parse(storedRedirect);
                if (action === 'wishlist' && designId) {
                    setTimeout(() => {
                        setWishlist((prev) => {
                            if (prev.includes(designId)) return prev;
                            const newState = [...prev, designId];
                            localStorage.setItem('user_wishlist', JSON.stringify(newState));
                            return newState;
                        });
                        sessionStorage.removeItem('auth_redirect');
                    }, 500);
                } else if (action === 'select_design' && designId) {
                    // Search in loaded designs
                    const targetDesign = designs.find(d => d.id === designId);
                    if (targetDesign) {
                        handleSelectDesign(targetDesign);
                        sessionStorage.removeItem('auth_redirect');
                    }
                }
            } catch (e) {
                console.error("Error resuming action", e);
            }
        }
    }, [isAuthenticated, handleSelectDesign, designs]);


    if (!mounted) return null;

    // --- Variants ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
            },
        },
    };

    return (
        <>
            <Head>
                <title>Explore Designs | Amma Embroidery</title>
                <meta name="description" content="Browse our carefully crafted embroidery designs for every occasion." />
            </Head>

            <div className="min-h-screen bg-[#F9F7F3] pt-20 pb-24 px-2.5 sm:px-4 lg:px-8 font-sans">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h1 className="font-serif text-3xl md:text-4xl text-[#1C1C1C] mb-2">
                            Designs Gallery
                        </h1>
                        <p className="text-[#555555] text-base max-w-xl mx-auto font-light">
                            Curated embroidery patterns for the modern aesthetic.
                        </p>
                    </motion.div>

                    {/* Shop by Style - Primary Filter */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-12"
                    >
                        <h3 className="text-sm font-semibold text-[#1C1C1C] uppercase tracking-wider mb-6 text-center">
                            Shop by Style
                        </h3>
                        {/* Container with overflow-visible and generous padding to prevent clipping of outline-offset */}
                        <div className="flex overflow-visible gap-8 py-4 justify-start sm:justify-center items-center overflow-x-auto no-scrollbar scrollbar-hide px-6 sm:px-0">
                            {STYLE_SHORTCUTS.map((style) => {
                                const isActive = selectedCategory === style.label;
                                return (
                                    <div
                                        key={style.id}
                                        onClick={() => handleStyleClick(style.label)}
                                        className="flex flex-col items-center gap-3 group cursor-pointer min-w-[70px] flex-shrink-0 relative"
                                    >
                                        <div
                                            className={`
                                                w-16 h-16 sm:w-20 sm:h-20 rounded-full ${style.color}
                                                flex items-center justify-center overflow-visible transition-all duration-300 relative
                                                ${isActive ? 'outline outline-2 outline-[#C9A14A] outline-offset-[4px]' : 'border border-transparent hover:border-[#C9A14A]'}
                                            `}
                                        >
                                            {/* Fabric Texture Placeholder */}
                                            <div className={`opacity-20 transform transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                                {style.label === 'All' ? (
                                                    <Grid size={24} className="text-[#1C1C1C]" />
                                                ) : (
                                                    <Grid size={24} className="text-[#1C1C1C]" />
                                                )}
                                            </div>
                                        </div>
                                        <span
                                            className={`
                                                text-xs sm:text-sm font-medium transition-colors duration-300
                                                ${isActive ? 'text-[#C9A14A] font-semibold' : 'text-[#555555] group-hover:text-[#1C1C1C]'}
                                            `}
                                        >
                                            {style.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Design Grid */}
                    <motion.div
                        layout
                        variants={containerVariants}
                        initial={shouldAnimate ? "hidden" : "visible"}
                        animate="visible"
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8"
                    >
                        <AnimatePresence mode='popLayout'>
                            {filteredDesigns.map((design) => (
                                <DesignCard
                                    key={design.id}
                                    design={design}
                                    wishlist={wishlist}
                                    toggleWishlist={toggleWishlist}
                                    onCardClick={() => handleCardClick(design)}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {filteredDesigns.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <p className="text-[#555555] font-serif text-lg">No designs found.</p>
                            <button
                                onClick={() => setSelectedCategory('All')}
                                className="mt-4 text-[#C9A14A] underline text-sm"
                            >
                                View All Designs
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Design Preview Overlay */}
            <AnimatePresence>
                {selectedDesign && (
                    <DesignPreviewOverlay
                        design={selectedDesign}
                        onClose={() => setSelectedDesign(null)}
                        onSelect={handleSelectDesign}
                        wishlist={wishlist}
                        toggleWishlist={toggleWishlist}
                    />
                )}
            </AnimatePresence>

            {/* Mobile Utility Bar (Sticky Bottom) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 pb-safe z-50 sm:hidden shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                <div className="flex justify-around items-center">
                    <button
                        onClick={() => setActiveTab('filter')}
                        className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'filter' ? 'text-[#C9A14A]' : 'text-[#999999]'}`}
                    >
                        <Filter size={20} />
                        <span className="text-[10px] font-medium uppercase tracking-wide">Filter</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('styles')}
                        className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'styles' ? 'text-[#C9A14A]' : 'text-[#999999]'}`}
                    >
                        <Grid size={20} />
                        <span className="text-[10px] font-medium uppercase tracking-wide">Styles</span>
                    </button>
                    <button
                        onClick={() => router.push('/saved-designs')}
                        className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'saved' ? 'text-[#C9A14A]' : 'text-[#999999]'}`}
                    >
                        <Bookmark size={20} />
                        <span className="text-[10px] font-medium uppercase tracking-wide">Saved ({wishlist.length})</span>
                    </button>
                </div>
            </div>

            {/* Add padding to bottom to account for fixed bar on mobile */}
            <div className="h-16 sm:hidden"></div>
        </>
    );
}
