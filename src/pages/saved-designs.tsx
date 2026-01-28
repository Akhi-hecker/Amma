import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowRight, Heart } from 'lucide-react';
import DesignCard from '@/components/DesignCard';
import DesignPreviewOverlay from '@/components/DesignPreviewOverlay';
import { useAuth } from '@/context/AuthContext';
import { Design } from '@/data/designs';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';

// Helper to assign color based on category (Replica of designs.tsx logic)
const getImageColor = (category: string) => {
    switch (category) {
        case 'Floral': return 'bg-rose-100';
        case 'Traditional': return 'bg-amber-100';
        case 'Modern': return 'bg-slate-100';
        case 'Bridal': return 'bg-red-50';
        case 'Minimal': return 'bg-green-50';
        case 'Festive': return 'bg-yellow-50';
        case 'Border': return 'bg-orange-50';
        case 'Heavy': return 'bg-purple-100';
        default: return 'bg-gray-50';
    }
};

export default function SavedDesigns() {
    const router = useRouter();
    const { isAuthenticated, protectAction, user } = useAuth();
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [savedDesigns, setSavedDesigns] = useState<Design[]>([]);
    const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const fetchSavedDesigns = async () => {
            // User: Fetch from Firestore subcollection
            if (user) {
                try {
                    const wishlistRef = collection(db, 'users', user.id, 'wishlist');
                    const snapshot = await getDocs(wishlistRef);

                    const mappedDesigns: Design[] = [];
                    snapshot.forEach((docSnap) => {
                        const data = docSnap.data();
                        if (data.id) {
                            mappedDesigns.push({
                                id: data.id,
                                name: data.name,
                                category: data.category,
                                image: data.image || getImageColor(data.category),
                                descriptor: data.descriptor || '',
                                long_description: data.long_description,
                                fabric_suitability: data.fabric_suitability,
                                complexity: data.complexity,
                                base_price: data.base_price,
                                is_active: data.is_active
                            } as Design);
                        }
                    });

                    mappedDesigns.reverse();
                    setSavedDesigns(mappedDesigns);
                    setWishlist(mappedDesigns.map(d => d.id));
                } catch (err) {
                    console.error("Error fetching user wishlist:", err);
                } finally {
                    setLoading(false);
                }
            }
            // Guest: Fetch from LocalStorage IDs + Firestore Design Details
            else {
                try {
                    const localIds = JSON.parse(localStorage.getItem('user_wishlist') || '[]');
                    if (localIds.length === 0) {
                        setSavedDesigns([]);
                        setWishlist([]);
                        setLoading(false);
                        return;
                    }

                    setWishlist(localIds);

                    // Fetch details for each ID
                    const designPromises = localIds.map((id: string) => getDoc(doc(db, 'designs', id)));
                    const snapshots = await Promise.all(designPromises);

                    const mappedDesigns: Design[] = [];
                    snapshots.forEach(snap => {
                        if (snap.exists()) {
                            const data = snap.data();
                            mappedDesigns.push({
                                id: snap.id,
                                name: data.name,
                                category: data.category,
                                image: data.image || getImageColor(data.category),
                                descriptor: data.short_description || '',
                                long_description: data.long_description,
                                fabric_suitability: data.fabric_suitability,
                                complexity: data.complexity,
                                base_price: data.base_price,
                                is_active: data.is_active !== false
                            } as Design);
                        }
                    });

                    // Keep order of addition (though Promise.all preserves order of IDs, we reversed logic?)
                    // If localIds acts as stack, map preserves stack order.
                    // Let's just reverse to show latest first like user logic
                    mappedDesigns.reverse();

                    setSavedDesigns(mappedDesigns);

                } catch (err) {
                    console.error("Error fetching guest wishlist:", err);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchSavedDesigns();
    }, [user]);


    const toggleWishlist = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();

        // Optimistic Update
        const previousDesigns = [...savedDesigns];
        setSavedDesigns(prev => prev.filter(d => d.id !== id));
        setWishlist(prev => prev.filter(wid => wid !== id));

        if (user) {
            protectAction(async () => {
                try {
                    const docRef = doc(db, 'users', user.id, 'wishlist', id);
                    await deleteDoc(docRef);
                } catch (err) {
                    console.error("Remove failed", err);
                    setSavedDesigns(previousDesigns);
                    setWishlist(previousDesigns.map(d => d.id));
                    alert("Failed to remove design.");
                }
            }, { action: 'wishlist', designId: id });
        } else {
            // Guest Remove
            try {
                const localIds = JSON.parse(localStorage.getItem('user_wishlist') || '[]');
                const newIds = localIds.filter((wid: string) => wid !== id);
                localStorage.setItem('user_wishlist', JSON.stringify(newIds));
            } catch (err) {
                console.error("Guest remove failed", err);
                setSavedDesigns(previousDesigns);
                setWishlist(previousDesigns.map(d => d.id));
            }
        }
    };

    const handleSelectDesign = (design: Design) => {
        router.push({
            pathname: '/service-selection',
            query: { designId: design.id },
        });
    };

    if (loading) return null; // Or a skeleton loader
    if (!mounted && typeof window !== 'undefined') setMounted(true); // Hydration fix helper if needed, but existing useAuth handles hydration check essentially via loading state of this component

    return (
        <>
            <Head>
                <title>Saved Designs | Amma Embroidery</title>
                <meta name="description" content="Your personal collection of favorite embroidery designs." />
            </Head>

            {/* Page Header */}
            <div className="min-h-screen bg-[#F9F7F3] pt-[84px] md:pt-[96px] pb-24 px-2.5 sm:px-4 lg:px-8 font-sans">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="font-serif text-3xl text-[#1C1C1C] mb-2">Saved Designs</h1>
                        <p className="text-[#555555] text-sm">Your personal collection</p>
                    </div>

                    {/* Content */}
                    <AnimatePresence mode='wait'>
                        {savedDesigns.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8"
                            >
                                <AnimatePresence mode='popLayout'>
                                    {savedDesigns.map((design) => (
                                        <DesignCard
                                            key={design.id}
                                            design={design}
                                            wishlist={wishlist}
                                            toggleWishlist={toggleWishlist}
                                            onCardClick={() => setSelectedDesign(design)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-32 text-center"
                            >
                                <div className="w-16 h-16 bg-[#F0EFEC] rounded-full flex items-center justify-center mb-6">
                                    <Heart size={24} className="text-[#999999]" />
                                </div>
                                <h3 className="font-serif text-xl text-[#1C1C1C] mb-2">
                                    You haven’t saved any designs yet.
                                </h3>
                                <p className="text-[#555555] text-sm max-w-xs mx-auto mb-8 font-light">
                                    Save your favorite embroidery patterns to view them here later.
                                </p>
                                <button
                                    onClick={() => router.push('/designs')}
                                    className="px-8 py-3 bg-[#C9A14A] text-white text-sm font-semibold uppercase tracking-wider rounded shadow-md hover:bg-[#B08D40] transition-colors flex items-center gap-2"
                                >
                                    Browse Designs
                                    <ArrowRight size={16} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

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
        </>
    );
}

// Ensure hydration state
function useMounted() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return mounted;
}
