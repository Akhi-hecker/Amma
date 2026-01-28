import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import DesignCard from './DesignCard';
import DesignPreviewOverlay from './DesignPreviewOverlay';
import { Design, EXAMPLE_DESIGNS } from '@/data/designs';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

const TopDesigns = () => {
    const router = useRouter();
    const { isAuthenticated, user, protectAction } = useAuth();
    const [designs, setDesigns] = useState<Design[]>([]);
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);

    // Fetch Designs
    useEffect(() => {
        async function fetchDesigns() {
            try {
                const designsRef = collection(db, 'designs');
                // Fetch 8 active designs (max needed for desktop)
                const q = query(designsRef, where('is_active', '==', true), limit(8));
                const querySnapshot = await getDocs(q);

                const mappedDesigns: Design[] = [];
                querySnapshot.forEach((doc) => {
                    const item = doc.data();
                    let imageColor = 'bg-gray-50';
                    switch (item.category) {
                        case 'Floral': imageColor = 'bg-rose-100'; break;
                        case 'Traditional': imageColor = 'bg-amber-100'; break;
                        case 'Modern': imageColor = 'bg-slate-100'; break;
                        default: imageColor = 'bg-gray-50';
                    }

                    mappedDesigns.push({
                        id: item.id || doc.id,
                        name: item.name,
                        category: item.category,
                        image: item.image || imageColor,
                        descriptor: item.descriptor || '',
                        long_description: item.long_description,
                        fabric_suitability: item.fabric_suitability,
                        complexity: item.complexity,
                        base_price: item.base_price,
                        is_active: item.is_active
                    } as Design);
                });

                if (mappedDesigns.length > 0) {
                    setDesigns(mappedDesigns);
                } else {
                    setDesigns(EXAMPLE_DESIGNS.slice(0, 8));
                }
            } catch (err) {
                console.error('Error fetching designs:', err);
                setDesigns(EXAMPLE_DESIGNS.slice(0, 8));
            } finally {
                setLoading(false);
            }
        }

        fetchDesigns();
    }, []);

    // Fetch Wishlist
    useEffect(() => {
        const fetchWishlist = async () => {
            if (!isAuthenticated || !user) return;
            try {
                const wishlistRef = collection(db, 'users', user.id, 'wishlist');
                const snapshot = await getDocs(wishlistRef);
                const wishlistIds = snapshot.docs.map(doc => doc.id);
                setWishlist(wishlistIds);
            } catch (err) {
                console.error("Error fetching wishlist", err);
            }
        };
        fetchWishlist();
    }, [isAuthenticated, user]);

    const toggleWishlist = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();

        protectAction(async () => {
            if (!user) return;

            const isLiked = wishlist.includes(id);
            const prevWishlist = [...wishlist];
            const newWishlist = isLiked
                ? wishlist.filter((itemId) => itemId !== id)
                : [...wishlist, id];

            setWishlist(newWishlist);

            try {
                const wishlistDocRef = doc(db, 'users', user.id, 'wishlist', id);
                if (isLiked) {
                    await deleteDoc(wishlistDocRef);
                } else {
                    const design = designs.find(d => d.id === id);
                    if (design) {
                        await setDoc(wishlistDocRef, {
                            ...design,
                            saved_at: new Date().toISOString()
                        });
                    }
                }
            } catch (err) {
                console.error("Wishlist sync failed", err);
                setWishlist(prevWishlist);
            }
        }, { action: 'wishlist', designId: id });
    };

    const handleSelectDesign = useCallback((design: Design) => {
        router.push({
            pathname: '/service-selection',
            query: { designId: design.id },
        });
    }, [router]);

    if (loading) return null;

    return (
        <section className="w-full py-20 md:py-32 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-8 max-w-[1400px]">

                {/* Centered Header */}
                <div className="text-center mb-16 md:mb-24">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[#C9A14A] text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
                    >
                        Curated Collection
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.7 }}
                        className="text-4xl md:text-6xl font-serif text-[#1C1C1C] leading-[1.1]"
                    >
                        Trending <span className="italic text-gray-400 font-light">Embroideries</span>
                    </motion.h2>
                </div>

                {/* Grid with Staggered Animation */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.08
                            }
                        }
                    }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 mb-16 md:mb-20"
                >
                    {designs.map((design, index) => (
                        <motion.div
                            key={design.id}
                            variants={{
                                hidden: { opacity: 0, y: 40 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
                                }
                            }}

                        >
                            <DesignCard
                                design={design}
                                wishlist={wishlist}
                                toggleWishlist={toggleWishlist}
                                onCardClick={() => setSelectedDesign(design)}
                            />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Premium Centered CTA */}
                <div className="text-center">
                    <Link
                        href="/designs"
                        className="group inline-flex items-center gap-3 px-8 py-4 border border-[#1C1C1C]/20 hover:border-[#1C1C1C] text-[#1C1C1C] font-semibold text-sm tracking-[0.1em] uppercase transition-all duration-300 hover:bg-[#1C1C1C] hover:text-white"
                    >
                        Explore All Collection
                        <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                </div>

                {/* Overlay */}
                <AnimatePresence>
                    {selectedDesign && (
                        <DesignPreviewOverlay
                            design={selectedDesign}
                            onClose={() => router.push('/designs')}
                            onSelect={handleSelectDesign}
                            wishlist={wishlist}
                            toggleWishlist={toggleWishlist}
                        />
                    )}
                </AnimatePresence>

            </div>
        </section>
    );
};

export default TopDesigns;
