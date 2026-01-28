import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Trash2, Edit2, ShoppingBag, ChevronRight, X } from 'lucide-react';
import CheckoutBreadcrumbs from '@/components/CheckoutBreadcrumbs';

// --- Types ---
interface BagItem {
    id: string; // can be 'guest_...' or firestore ID
    designName: string;
    designImage: string;
    serviceType: string;
    rawServiceType: string; // Added for routing
    selections: {
        garment?: string;
        fabric: string;
        fabricId: string;
        color: string;
        colorId: string;
        colorHex: string;
        length?: number;
        sizeType?: 'standard' | 'custom';
        sizeValue?: string;
        sizeDisplay?: string;
        // Stitching
        garmentId?: string;
        standardSizeId?: string;
        customMeasurements?: any;
    };
    designId: string;
    price: number;
    quantity: number;
    _isGuest?: boolean;
}

// ... (skipping to handleEdit replacement, need to ensure I don't break the component structure. Better to do multi-replace or careful chunking)
// Wait, I cannot define BagItem inside the component if it's outside. It is outside.
// I will split this into multiple calls or one large call if the file is small enough.
// The file is 500 lines. I will use replace_file_content for specific blocks.

export default function ShoppingBagPage() {
    const router = useRouter();
    const { user, protectAction } = useAuth(); // Ensure protectAction is destructured
    const [mounted, setMounted] = useState(false);
    const [bagItems, setBagItems] = useState<BagItem[]>([]);
    const [itemToRemove, setItemToRemove] = useState<string | null>(null);

    // --- 1. Migration Logic (Moved to global hook) ---
    // See: hooks/useGuestMigration.ts

    // --- 2. Data Fetching (User vs Guest) ---
    useEffect(() => {
        setMounted(true);

        if (user) {
            // --- Authenticated: Fetch from Firestore ---
            const draftsRef = collection(db, 'users', user.id, 'drafts');
            const q = query(draftsRef, where('status', '==', 'draft'));

            const unsubscribe = onSnapshot(q, async (snapshot) => {
                const draftPromises = snapshot.docs.map(async (draftDoc) => {
                    const data = draftDoc.data();

                    // Defaults
                    let designName = 'Unknown Design';
                    let designImage = 'bg-gray-100';
                    let fabricName = 'Unknown Fabric';
                    let colorName = 'Unknown Color';
                    let colorHex = '#ccc';

                    // Fetch Design
                    if (data.design_id) {
                        const designSnap = await getDoc(doc(db, 'designs', data.design_id));
                        if (designSnap.exists()) {
                            const d = designSnap.data();
                            designName = d.name || d.title;
                            if (d.category === 'Floral') designImage = 'bg-rose-100';
                            else if (d.category === 'Traditional') designImage = 'bg-amber-100';
                            else designImage = 'bg-slate-100';
                            if (d.image) designImage = d.image;
                        }
                    }

                    // Fetch Fabric & Color (Logic Differentiated by Service)
                    if (data.service_type === 'send_your_fabric') {
                        if (data.fabric_details) {
                            fabricName = data.fabric_details.fabric_type || 'Custom Fabric';
                            colorName = data.fabric_details.color || 'Custom Color';
                        }
                    } else {
                        if (data.fabric_id) {
                            const fabricSnap = await getDoc(doc(db, 'fabrics', data.fabric_id));
                            if (fabricSnap.exists()) fabricName = fabricSnap.data().name;
                        }
                        if (data.color_id) {
                            const colorSnap = await getDoc(doc(db, 'fabric_colors', data.color_id));
                            if (colorSnap.exists()) {
                                const c = colorSnap.data();
                                colorName = c.name;
                                colorHex = c.hex_code || '#ccc';
                            }
                        }
                    }

                    // Determine Service Type Label
                    let serviceTypeLabel = 'Embroidery Cloth Only';
                    if (data.service_type === 'embroidery_stitching') serviceTypeLabel = 'Custom Stitching';
                    else if (data.service_type === 'send_your_fabric') {
                        serviceTypeLabel = 'Send Your Fabric';
                        if (data.fabric_details?.processing_type === 'embroidery_stitching') {
                            serviceTypeLabel += ' (With Stitching)';
                        } else {
                            serviceTypeLabel += ' (Embroidery Only)';
                        }
                    }

                    // Fetch Size Info
                    let sizeDisplay = '';
                    let targetSizeId = null;

                    if (data.service_type === 'embroidery_stitching') {
                        targetSizeId = data.standard_size_id;
                        if (data.custom_measurements) sizeDisplay = 'Custom ';
                    } else if (data.service_type === 'send_your_fabric') {
                        if (data.fabric_details?.standard_size_id) {
                            targetSizeId = data.fabric_details.standard_size_id;
                        } else if (data.fabric_details?.custom_measurements) {
                            sizeDisplay = 'Custom Size';
                        }
                    }

                    if (targetSizeId) {
                        const sizeSnap = await getDoc(doc(db, 'standard_sizes', targetSizeId));
                        if (sizeSnap.exists()) {
                            sizeDisplay = `Size: ${sizeSnap.data().label}`;
                        }
                    }

                    return {
                        id: draftDoc.id,
                        designName,
                        designImage,
                        serviceType: serviceTypeLabel,
                        rawServiceType: data.service_type,
                        selections: {
                            fabric: fabricName,
                            fabricId: data.fabric_id,
                            color: colorName,
                            colorId: data.color_id,
                            colorHex: colorHex,
                            length: data.custom_measurements?.length || data.quantity, // fallback
                            sizeDisplay,
                            garmentId: data.garment_type_id,
                            standardSizeId: data.standard_size_id,
                            customMeasurements: data.custom_measurements
                        },
                        designId: data.design_id,
                        price: data.estimated_price || 0,
                        quantity: data.quantity || 1,
                        _isGuest: false
                    } as BagItem;
                });

                const resolvedItems = await Promise.all(draftPromises);
                setBagItems(resolvedItems);
            });

            return () => unsubscribe();
        } else {
            // --- Guest: Fetch from LocalStorage ---
            const loadGuestItems = () => {
                const guestBagJSON = localStorage.getItem('amma_guest_bag');
                if (guestBagJSON) {
                    try {
                        const guestItems = JSON.parse(guestBagJSON);
                        if (Array.isArray(guestItems)) {
                            const mappedItems = guestItems.map((item: any) => {
                                // Reconstruct BagItem from cached _displayDetails or raw data
                                const details = item._displayDetails || {};

                                let serviceTypeLabel = 'Embroidery Cloth Only';
                                if (item.service_type === 'embroidery_stitching') serviceTypeLabel = 'Custom Stitching';
                                // ... simplified label logic for guest display

                                return {
                                    id: item.id,
                                    designName: details.designName || 'Custom Design',
                                    designImage: details.designImage || 'bg-gray-100',
                                    serviceType: serviceTypeLabel,
                                    rawServiceType: item.service_type,
                                    selections: {
                                        fabric: details.fabricName || 'Selected Fabric',
                                        fabricId: item.fabric_id,
                                        color: details.colorName || 'Selected Color',
                                        colorId: item.color_id,
                                        colorHex: details.colorHex || '#ccc',
                                        length: details.length || 1,
                                        sizeDisplay: details.size,
                                        garmentId: item.garment_type_id,
                                        standardSizeId: item.standard_size_id,
                                        customMeasurements: item.custom_measurements
                                    },
                                    designId: item.design_id,
                                    price: item.estimated_price || 0,
                                    quantity: item.quantity || 1,
                                    _isGuest: true
                                } as BagItem;
                            });
                            setBagItems(mappedItems);
                        }
                    } catch (e) {
                        console.error("Error loading guest bag", e);
                    }
                } else {
                    setBagItems([]);
                }
            };

            loadGuestItems();
            // Listen for custom event if in same tab
            window.addEventListener('bagUpdated', loadGuestItems);
            return () => window.removeEventListener('bagUpdated', loadGuestItems);
        }
    }, [user]);

    const updateQuantity = async (id: string, newQuantity: number) => {
        const item = bagItems.find(i => i.id === id);
        if (!item) return;

        if (user && !item._isGuest) {
            const itemRef = doc(db, 'users', user.id, 'drafts', id);
            await updateDoc(itemRef, { quantity: newQuantity });
        } else {
            // Guest Update
            const guestBagJSON = localStorage.getItem('amma_guest_bag');
            if (guestBagJSON) {
                const guestItems = JSON.parse(guestBagJSON);
                const updated = guestItems.map((gi: any) =>
                    gi.id === id ? { ...gi, quantity: newQuantity } : gi
                );
                localStorage.setItem('amma_guest_bag', JSON.stringify(updated));
                window.dispatchEvent(new Event('bagUpdated'));
            }
        }
    };

    const handleConfirmRemove = async () => {
        if (!itemToRemove) return;
        const item = bagItems.find(i => i.id === itemToRemove);

        if (item) {
            if (user && !item._isGuest) {
                await deleteDoc(doc(db, 'users', user.id, 'drafts', itemToRemove));
            } else {
                // Guest Remove
                const guestBagJSON = localStorage.getItem('amma_guest_bag');
                if (guestBagJSON) {
                    const guestItems = JSON.parse(guestBagJSON);
                    const updated = guestItems.filter((gi: any) => gi.id !== itemToRemove);
                    localStorage.setItem('amma_guest_bag', JSON.stringify(updated));
                    window.dispatchEvent(new Event('bagUpdated'));
                }
            }
        }
        setItemToRemove(null);
    };

    const handleEdit = (id: string) => {
        const item = bagItems.find(i => i.id === id);
        if (item) {
            let pathname = '/embroidery-garment-selection';
            if (item.rawServiceType === 'cloth_only') pathname = '/embroidery-cloth-only';
            else if (item.rawServiceType === 'send_your_fabric') pathname = '/send-your-fabric';

            const query: any = {
                designId: item.designId,
                fabricId: item.selections.fabricId,
                colorId: item.selections.colorId,
                editId: item.id
            };

            if (item.selections.length) query.length = item.selections.length;
            if (item.selections.garmentId) query.garmentId = item.selections.garmentId;
            if (item.selections.standardSizeId) {
                query.sizeMode = 'standard';
                query.standardSizeId = item.selections.standardSizeId;
            }
            if (item.selections.customMeasurements) {
                // Only set sizeMode if not standard
                if (!query.standardSizeId) query.sizeMode = 'custom';

                // Flatten custom measurements
                Object.entries(item.selections.customMeasurements).forEach(([k, v]) => {
                    query[`custom_${k}`] = v;
                });
            }

            router.push({ pathname, query });
        }
    };

    const handleProceedToCheckout = () => {
        protectAction(() => {
            router.push('/checkout');
        }, { action: 'checkout' });
    };

    // Calculations
    const subtotal = bagItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = 0; // Free for premium? Or calculated.
    const total = subtotal + delivery;

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-32 pt-[64px] md:pt-[68px] lg:pt-[72px]">
            <Head>
                <title>Shopping Bag | Amma Embroidery</title>
            </Head>

            {/* --- Main Content --- */}
            <main className="min-h-screen pb-40">
                <div className="w-full max-w-7xl mx-auto px-4 mt-8 mb-6 flex justify-center">
                    <CheckoutBreadcrumbs currentStep="bag" />
                </div>

                <div className="px-4 space-y-6 max-w-lg mx-auto">

                    <div className="text-center mb-8">
                        <h1 className="font-serif text-3xl text-[#1C1C1C]">Shopping Bag</h1>
                    </div>
                    <AnimatePresence mode='popLayout'>
                        {bagItems.length > 0 ? (
                            <>
                                {/* --- Bag Items List --- */}
                                <div className="space-y-4">
                                    {bagItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="bg-white rounded-xl p-3 shadow-sm border border-[#E8E6E0] relative overflow-hidden"
                                        >
                                            <div className="flex gap-3">
                                                {/* Thumbnail */}
                                                <div className="w-20 h-24 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                                                    <div className={`absolute inset-0 ${item.designImage} opacity-30`} />
                                                    <div className="absolute inset-0 flex items-center justify-center text-[#999] text-[10px]">
                                                        IMG
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                    <div>
                                                        <h3 className="font-serif text-[15px] text-[#1C1C1C] leading-snug truncate">
                                                            {item.designName}
                                                        </h3>
                                                        <p className="text-[11px] text-[#777] uppercase tracking-wide mb-1">
                                                            {item.serviceType}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 text-xs text-[#5A5751]">
                                                            <span>{item.selections.fabric}</span>
                                                            <span className="text-[#E8E6E0]">•</span>
                                                            <span className="flex items-center gap-1">
                                                                <span className="w-2 h-2 rounded-full border border-black/10" style={{ backgroundColor: item.selections.colorHex }} />
                                                                {item.selections.color}
                                                            </span>
                                                            {item.selections.sizeDisplay && (
                                                                <>
                                                                    <span className="text-[#E8E6E0]">•</span>
                                                                    <span className="font-medium text-[#1C1C1C]">
                                                                        {item.selections.sizeDisplay.startsWith('Size:') ? item.selections.sizeDisplay : `Size: ${item.selections.sizeDisplay}`}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between items-end mt-2">
                                                        <span className="font-medium text-[#1C1C1C]">
                                                            ₹{(item.price * item.quantity).toLocaleString()}
                                                        </span>

                                                        {/* Actions Row (Mobile Friendly) */}
                                                        <div className="flex items-center gap-3">
                                                            <select
                                                                value={item.quantity}
                                                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                                                className="text-xs font-medium bg-[#F9F7F3] border border-[#E8E6E0] rounded px-1.5 py-0.5 outline-none active:bg-white transition-colors"
                                                            >
                                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                                                    <option key={n} value={n}>{n}</option>
                                                                ))}
                                                            </select>
                                                            <div className="w-px h-3 bg-[#E8E6E0]" />
                                                            <button
                                                                onClick={() => handleEdit(item.id)}
                                                                className="text-xs font-medium text-[#C9A14A] active:text-[#B89240] py-1"
                                                            >
                                                                Edit
                                                            </button>
                                                            <div className="w-px h-3 bg-[#E8E6E0]" />
                                                            <button
                                                                onClick={() => setItemToRemove(item.id)}
                                                                className="text-xs font-medium text-[#999] active:text-red-500 transition-colors py-1"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* --- Order Summary --- */}
                                <div className="bg-white rounded-xl p-5 border border-[#E8E6E0]">
                                    <h3 className="font-serif text-lg text-[#1C1C1C] mb-4">Order Summary</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between text-[#5A5751]">
                                            <span>Subtotal ({bagItems.length} items)</span>
                                            <span>₹{subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-[#5A5751]">
                                            <span>Est. Delivery</span>
                                            <span className="text-[#1C1C1C]">5-7 Days</span>
                                        </div>
                                        <div className="h-px bg-[#E8E6E0] my-2" />
                                        <div className="flex justify-between items-end">
                                            <span className="font-medium text-[#1C1C1C]">Total</span>
                                            <span className="font-serif text-xl text-[#C9A14A] font-medium">
                                                ₹{total.toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-[#999] mt-2">
                                            Tax included. Shipping calculated at checkout.
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* --- Empty State --- */
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-20 text-center"
                            >
                                <div className="w-16 h-16 bg-[#F0EEE6] rounded-full flex items-center justify-center mb-4 text-[#C9A14A]">
                                    <ShoppingBag size={28} strokeWidth={1.5} />
                                </div>
                                <h2 className="font-serif text-xl text-[#1C1C1C] mb-2">Your bag is empty</h2>
                                <p className="text-sm text-[#777] mb-8 max-w-[200px]">
                                    Looks like you haven't added any beautiful embroidery yet.
                                </p>
                                <button
                                    onClick={() => router.push('/designs')}
                                    className="px-8 py-3 bg-[#C9A14A] text-white rounded-full font-medium shadow-lg shadow-[#C9A14A]/20 active:scale-95 transition-transform"
                                >
                                    Browse Designs
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* --- Sticky Bottom Bar (Only if items exist) --- */}
            {bagItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E6E0] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-50">
                    <div className="max-w-lg mx-auto flex flex-col gap-3">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-xs text-[#777] mb-1">Total Payable</span>
                            <span className="font-serif text-2xl text-[#1C1C1C]">
                                ₹{total.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push('/designs')}
                                className="flex-1 py-3.5 rounded-xl font-medium text-sm text-[#C9A14A] border border-[#C9A14A] active:bg-[#C9A14A]/5 transition-colors"
                            >
                                Continue Browsing
                            </button>
                            <button
                                onClick={handleProceedToCheckout}
                                className="flex-[2] py-3.5 rounded-xl font-medium text-sm text-white bg-[#C9A14A] shadow-lg shadow-[#C9A14A]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <span>Proceed to Checkout</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Confirmation Modal --- */}
            <AnimatePresence>
                {itemToRemove && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setItemToRemove(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm relative z-10"
                        >
                            <h3 className="font-serif text-lg text-[#1C1C1C] mb-2">Remove Item?</h3>
                            <p className="text-sm text-[#5A5751] mb-6">
                                Are you sure you want to remove this item from your bag?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setItemToRemove(null)}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#1C1C1C] bg-gray-100 hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmRemove}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
