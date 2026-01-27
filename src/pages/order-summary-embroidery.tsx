import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Loader2, MapPin, ChevronRight, Plus, Check } from 'lucide-react';
import { Design } from '@/data/designs';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, query, orderBy, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// ...

// Use Auth (using Firebase listener)
interface Address {
    id: string;
    full_name: string;
    address_line1: string;
    city: string;
    pincode: string;
    state: string;
    address_type: string;
    is_default?: boolean;
}

export default function OrderSummaryEmbroideryPage() {
    const router = useRouter();
    const { designId } = router.query;
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Data State
    const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
    const [selectedFabric, setSelectedFabric] = useState<any>(null);
    const [selectedColor, setSelectedColor] = useState<any>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

    // Modal State
    const [showAddressModal, setShowAddressModal] = useState(false);

    // Length & Size
    const selectedLength = router.query.length ? parseFloat(router.query.length as string) : 0;
    const sizeType = router.query.sizeType; // standard / custom
    const sizeDetails = router.query.sizeDetails; // potentially parsed

    // ... (rest logic handled in render, but need to be accessible)
    // Actually, logic for costs needs to be inside component body.

    // Helper handlers
    const handleEdit = (step: string) => {
        // basic nav back
        router.back();
    };

    // Cost Calcs (Simplified for reconstruction)
    const isStitching = router.query.garmentId;
    const garmentName = "Custom Garment"; // Placeholder or fetch
    // Real logic would be more complex, fetching garment details etc.
    // Assuming variables are available in scope or need to be derived.

    // RECONSTRUCTION NOTE: The original file had extensive logic for costs. 
    // I need to ensure variables like 'garmentBasePrice', 'embroideryCost', 'fabricCost', 'stitchingCost', 'totalPrice' are defined.

    // Pricing Calculation
    const garmentBasePrice = 0; // TODO: Fetch from garment selection if applicable
    const embroideryCost = selectedDesign?.base_price || 0;
    const fabricCost = selectedFabric ? (Number(selectedFabric.price_per_meter) * selectedLength) : 0;
    const stitchingCost = isStitching ? 1500 : 0; // standard stitching cost
    const totalPrice = garmentBasePrice + embroideryCost + fabricCost + stitchingCost;

    const sizeDisplay = "Standard M"; // Placeholder

    // ...
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (router.isReady) {
            fetchData();
        }
    }, [router.isReady, router.query]);

    // ...

    async function fetchData() {
        setIsLoading(true);
        try {
            // 1. Fetch Design
            if (designId) {
                const docRef = doc(db, 'designs', designId as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const designData = docSnap.data();
                    let imageColor = 'bg-gray-50';
                    if (designData.category === 'Floral') imageColor = 'bg-rose-100';
                    else if (designData.category === 'Traditional') imageColor = 'bg-amber-100';
                    else imageColor = 'bg-slate-100';

                    setSelectedDesign({
                        id: docSnap.id,
                        name: designData.name || designData.title,
                        category: designData.category,
                        image: designData.image || imageColor,
                        base_price: Number(designData.base_price) || 1200,
                        descriptor: designData.short_description || '',
                        long_description: designData.long_description,
                        fabric_suitability: designData.fabric_suitability,
                        complexity: designData.complexity,
                    } as Design);
                }
            }

            // 2. Fetch Fabric
            const { fabricId } = router.query;
            if (fabricId) {
                const fabricRef = doc(db, 'fabrics', fabricId as string);
                const fabricSnap = await getDoc(fabricRef);
                if (fabricSnap.exists()) {
                    setSelectedFabric({ id: fabricSnap.id, ...fabricSnap.data() });
                }
            }

            // 3. Fetch Color
            const { colorId } = router.query;
            if (colorId) {
                const colorRef = doc(db, 'fabric_colors', colorId as string);
                const colorSnap = await getDoc(colorRef);
                if (colorSnap.exists()) {
                    setSelectedColor({ id: colorSnap.id, ...colorSnap.data() });
                }
            }

            // 4. Fetch Addresses
            if (auth.currentUser) {
                const addrRef = collection(db, 'users', auth.currentUser.uid, 'addresses');
                // Sorting requires index usually, stick to simple fetch
                const addrSnap = await getDocs(addrRef);
                const fetchedAddr: Address[] = [];
                addrSnap.forEach(d => fetchedAddr.push({ id: d.id, ...d.data() } as Address));

                // Client side sort
                fetchedAddr.sort((a, b) => (a.is_default === b.is_default) ? 0 : a.is_default ? -1 : 1);

                setAddresses(fetchedAddr);

                const defaultAddr = fetchedAddr.find(a => a.is_default);
                if (defaultAddr) setSelectedAddressId(defaultAddr.id);
                else if (fetchedAddr.length > 0) setSelectedAddressId(fetchedAddr[0].id);
            }

        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }

    // ...

    const handleAddToBag = async () => {
        const { lengthId } = router.query;
        setIsLoading(true);

        try {
            if (!user) {
                // handle guest or redirect logic
                router.push('/login?returnUrl=' + encodeURIComponent(router.asPath));
                return;
            }

            // Prepare Data for order_drafts (subcollection of user or top level? Using user subcollection as per migration)
            // wait, previously we used 'order_drafts' top level in Supabase.
            // In My Orders migration we assumed `users/{uid}/drafts`. Let's stick to that.

            const draftData = {
                service_type: isStitching ? 'embroidery_stitching' : 'cloth_only',
                design_id: selectedDesign?.id,
                fabric_id: selectedFabric?.id,
                color_id: selectedColor?.id,
                estimated_price: totalPrice,
                quantity: 1,
                status: 'draft',
                garment_type_id: isStitching ? (router.query.garmentId || null) : null,
                fabric_length_id: !isStitching ? (lengthId || null) : null,
                custom_measurements: !isStitching && !lengthId ? { length: selectedLength } : null,
                address_id: selectedAddressId,
                created_at: new Date().toISOString()
            };

            const draftsRef = collection(db, 'users', user.uid, 'drafts');
            await addDoc(draftsRef, draftData);

            window.dispatchEvent(new Event('bagUpdated'));

            // Show Feedback
            alert("Added to Bag!");
            router.push('/shopping-bag');

        } catch (err) {
            console.error("Error adding to bag:", err);
            alert("Failed to add to bag. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-32 pt-[64px] md:pt-[68px] lg:pt-[72px]">
            <Head>
                <title>Order Summary | Amma Embroidery</title>
            </Head>

            {/* --- Sticky Top Bar --- */}
            <div className="sticky top-0 left-0 right-0 bg-[#F9F7F3]/90 backdrop-blur-md z-40 px-4 h-[60px] flex items-center justify-center border-b border-[#E8E6E0]">
                <h1 className="font-serif text-lg text-[#1C1C1C]">
                    Order Summary
                </h1>
            </div>

            <div className="max-w-md mx-auto px-4 py-6 space-y-8">

                {/* --- Design Card --- */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-4 shadow-sm border border-[#E8E6E0] flex items-center gap-4"
                >
                    <div className="w-16 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative">
                        <div className={`absolute inset-0 ${selectedDesign?.image || 'bg-gray-100'} opacity-50`} />
                        <div className="absolute inset-0 flex items-center justify-center text-[#999] text-[10px] text-center p-1">
                            Preview
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#999] font-medium mb-1">selected design</p>
                        <h3 className="font-serif text-lg text-[#1C1C1C] leading-tight mb-0.5">{selectedDesign?.name}</h3>
                        {/* Show Garment type if stitching logic, else category */}
                        <p className="text-sm text-[#5A5751]">
                            {isStitching ? garmentName : selectedDesign?.category}
                        </p>
                    </div>
                </motion.div>

                {/* --- Configuration Details --- */}
                <section>
                    <h2 className="font-serif text-xl border-b border-[#E8E6E0] pb-2 mb-4">Your Customization</h2>

                    <div className="space-y-5">

                        {/* Garment Type (Stitching Only) */}
                        {isStitching && (
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-[#999] uppercase tracking-wide mb-1">Garment</p>
                                    <p className="font-medium text-[#1C1C1C]">{garmentName}</p>
                                </div>
                                <button onClick={() => handleEdit('garment')} className="text-xs font-medium text-[#C9A14A] hover:text-[#B89240] py-1 px-2 -mr-2">Edit</button>
                            </div>
                        )}

                        {/* Fabric Row */}
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-[#999] uppercase tracking-wide mb-1">Fabric</p>
                                <p className="font-medium text-[#1C1C1C]">{selectedFabric?.name || 'Not Selected'}</p>
                            </div>
                            <button onClick={() => handleEdit('fabric')} className="text-xs font-medium text-[#C9A14A] hover:text-[#B89240] py-1 px-2 -mr-2">Edit</button>
                        </div>

                        {/* Color Row */}
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-[#999] uppercase tracking-wide mb-1">Color</p>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded-full border border-gray-200"
                                        style={{ backgroundColor: selectedColor?.hex_code || '#ccc' }}
                                    />
                                    <p className="font-medium text-[#1C1C1C]">{selectedColor?.name || 'Not Selected'}</p>
                                </div>
                            </div>
                            <button onClick={() => handleEdit('color')} className="text-xs font-medium text-[#C9A14A] hover:text-[#B89240] py-1 px-2 -mr-2">Edit</button>
                        </div>

                        {/* Size/Length Row */}
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-[#999] uppercase tracking-wide mb-1">
                                    {isStitching ? 'Size' : 'Length'}
                                </p>
                                <p className="font-medium text-[#1C1C1C]">
                                    {isStitching ? sizeDisplay : `${selectedLength} meters`}
                                </p>
                                {(sizeDetails && sizeType === 'custom') && (
                                    <p className="text-[10px] text-[#777] mt-1 line-clamp-1">
                                        {'Custom Fit'}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => handleEdit(isStitching ? 'size' : 'length')} className="text-xs font-medium text-[#C9A14A] hover:text-[#B89240] py-1 px-2 -mr-2">Edit</button>
                        </div>

                        {/* Stitching Included */}
                        {isStitching && (
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-[#999] uppercase tracking-wide mb-1">Stitching</p>
                                    <p className="font-medium text-[#1C1C1C]">Expert Tailoring Included</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* --- Address Selection (NEW) --- */}
                {user && (
                    <section className="bg-white rounded-xl p-5 border border-[#E8E6E0]">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-serif text-lg">Delivery Location</h2>
                            {selectedAddress && (
                                <button onClick={() => setShowAddressModal(true)} className="text-[#C9A14A] text-xs font-medium uppercase">Change</button>
                            )}
                        </div>

                        {selectedAddress ? (
                            <div className="flex items-start gap-3">
                                <MapPin className="text-[#555] mt-0.5" size={18} />
                                <div>
                                    <p className="text-sm font-medium text-[#1C1C1C]">{selectedAddress.full_name}</p>
                                    <p className="text-xs text-[#555] leading-relaxed mt-1">
                                        {selectedAddress.address_line1}, {selectedAddress.city} - {selectedAddress.pincode}
                                    </p>
                                    <span className="text-[10px] bg-[#F9F7F3] border border-gray-200 px-1.5 py-0.5 rounded text-[#777] uppercase mt-1.5 inline-block">
                                        {selectedAddress.address_type}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-[#777] mb-3">No address selected.</p>
                                <button
                                    onClick={() => router.push('/saved-addresses')}
                                    className="text-xs bg-[#F9F7F3] border border-[#E6E6E6] px-4 py-2 rounded-full font-medium inline-flex items-center gap-1 hover:bg-[#EAE8E4]"
                                >
                                    <Plus size={14} /> Add Address
                                </button>
                            </div>
                        )}
                    </section>
                )}


                {/* --- Price Breakdown --- */}
                <section className="bg-white rounded-xl p-5 border border-[#E8E6E0]">
                    <h2 className="font-serif text-lg mb-4">Price Details</h2>

                    <div className="space-y-3 text-sm">
                        {isStitching && (
                            <div className="flex justify-between text-[#5A5751]">
                                <span>Base Garment Price</span>
                                <span>₹{garmentBasePrice.toLocaleString()}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-[#5A5751]">
                            <span>Embroidery Cost</span>
                            <span>₹{embroideryCost.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between text-[#5A5751]">
                            <span>Fabric Cost {isStitching && '(Estimated)'}</span>
                            <span>₹{fabricCost.toLocaleString()}</span>
                        </div>

                        {isStitching && (
                            <div className="flex justify-between text-[#5A5751]">
                                <span>Stitching & Finishing</span>
                                <span>₹{stitchingCost.toLocaleString()}</span>
                            </div>
                        )}

                        <div className="h-px bg-[#E8E6E0] my-2" />

                        <div className="flex justify-between items-center bg-[#F9F7F3] -mx-5 -mb-5 p-5 mt-4 rounded-b-xl border-t border-[#E8E6E0]">
                            <div className="flex flex-col">
                                <span className="font-serif text-lg text-[#1C1C1C]">Total</span>
                                <span className="text-[10px] text-[#999] font-normal">Inclusive of all taxes</span>
                            </div>
                            <span className="font-serif text-xl text-[#C9A14A]">₹{totalPrice.toLocaleString()}</span>
                        </div>
                    </div>
                </section>

                <p className="text-xs text-center text-[#999] mt-2">
                    Final price confirmed before stitching begins.
                </p>

            </div>

            {/* --- Sticky CTA Section --- */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E6E0] p-4 pb-8 safe-area-pb shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-md mx-auto flex flex-col gap-3">
                    <div className="flex justify-between items-end mb-1">
                        <div>
                            <p className="text-xs text-[#777]">Total Payable</p>
                        </div>
                        <div className="text-2xl font-serif text-[#1C1C1C]">
                            ₹{totalPrice.toLocaleString()}
                        </div>
                    </div>

                    <button
                        onClick={handleAddToBag}
                        className="w-full py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 bg-[#C9A14A] text-white shadow-lg shadow-[#C9A14A]/30 hover:bg-[#B89240] transform active:scale-[0.98] transition-all duration-300"
                    >
                        <span>Add to Bag</span>
                        <ShoppingBag size={18} />
                    </button>

                    <button onClick={() => router.push('/shopping-bag')} className="text-xs text-[#999] text-center mt-1 underline decoration-gray-300 underline-offset-2">
                        View Bag
                    </button>
                </div>
            </div>

            {/* Address Selection Modal */}
            <AnimatePresence>
                {showAddressModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center pt-10"
                        onClick={() => setShowAddressModal(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white w-full max-h-[85vh] sm:max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-serif text-lg">Select Address</h3>
                                <button onClick={() => setShowAddressModal(false)} className="text-2xl leading-none">&times;</button>
                            </div>

                            <div className="p-4 overflow-y-auto space-y-3 flex-1">
                                {addresses.map(addr => (
                                    <div
                                        key={addr.id}
                                        onClick={() => { setSelectedAddressId(addr.id); setShowAddressModal(false); }}
                                        className={`p-4 rounded-xl border cursor-pointer border-gray-200 hover:border-[#C9A14A] transition-colors relative ${selectedAddressId === addr.id ? 'border-[#C9A14A] bg-[#FFFBF2]' : 'bg-white'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center ${selectedAddressId === addr.id ? 'border-[#C9A14A]' : 'border-gray-300'}`}>
                                                {selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-[#C9A14A]" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-[#1C1C1C]">{addr.full_name}</p>
                                                <p className="text-xs text-[#555] mt-1">{addr.address_line1}, {addr.city} - {addr.pincode}</p>
                                                <p className="text-[10px] text-[#999] mt-1 uppercase">{addr.address_type}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => { router.push('/saved-addresses'); setShowAddressModal(false); }}
                                    className="w-full py-3 rounded-xl border border-dashed border-[#C9A14A] text-[#C9A14A] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#FFFBF2]"
                                >
                                    <Plus size={16} /> Add New Address
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
