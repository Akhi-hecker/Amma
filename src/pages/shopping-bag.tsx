import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Edit2, ShoppingBag, ChevronRight, X } from 'lucide-react';

// --- Types ---
interface BagItem {
    id: string;
    designName: string;
    designImage: string; // Placeholder color or URL
    serviceType: string;
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
    };
    designId: string;
    price: number;
    quantity: number;
}

// --- Mock Data ---
const MOCK_BAG_ITEMS: BagItem[] = [
    {
        id: 'item-1',
        designName: 'Royal Peacock Motif',
        designImage: 'bg-red-900',
        serviceType: 'Embroidery Cloth Only',
        selections: {
            fabric: 'Raw Silk',
            fabricId: 'raw-silk',
            color: 'Crimson Red',
            colorId: 'crimson',
            colorHex: '#DC143C',
            length: 2.5
        },
        price: 3250,
        designId: 'design-1',
        quantity: 1
    },
    {
        id: 'item-2',
        designName: 'Golden Lotus Border',
        designImage: 'bg-yellow-700',
        serviceType: 'Embroidery Cloth Only',
        selections: {
            fabric: 'Cotton Silk',
            fabricId: 'cotton-silk',
            color: 'Midnight Blue',
            colorId: 'midnight',
            colorHex: '#191970',
            length: 1.5
        },
        price: 1800,
        designId: 'design-2',
        quantity: 1
    }
];

export default function ShoppingBagPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [bagItems, setBagItems] = useState<BagItem[]>([]);
    const [itemToRemove, setItemToRemove] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        // Load bag items from localStorage
        const savedBag = localStorage.getItem('amma_bag');
        if (savedBag) {
            try {
                setBagItems(JSON.parse(savedBag));
            } catch (e) {
                console.error("Failed to parse bag items", e);
                setBagItems([]);
            }
        }
    }, []);

    const updateBag = (newItems: BagItem[]) => {
        setBagItems(newItems);
        localStorage.setItem('amma_bag', JSON.stringify(newItems));
        window.dispatchEvent(new Event('bagUpdated'));
    };

    const updateQuantity = (id: string, newQuantity: number) => {
        const newItems = bagItems.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        );
        updateBag(newItems);
    };

    const handleConfirmRemove = () => {
        if (itemToRemove) {
            const newItems = bagItems.filter(item => item.id !== itemToRemove);
            updateBag(newItems);
            setItemToRemove(null);
        }
    };

    const handleEdit = (id: string) => {
        const item = bagItems.find(i => i.id === id);
        if (item) {
            router.push({
                pathname: '/embroidery-cloth-only',
                query: {
                    designId: item.designId,
                    fabricId: item.selections.fabricId,
                    colorId: item.selections.colorId,
                    length: item.selections.length,
                    editId: item.id // Pass the bag item ID to track it
                }
            });
        }
    };

    const handleProceedToCheckout = () => {
        router.push('/checkout'); // Placeholder route
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

            {/* --- Sticky Top Bar --- */}
            <header className="sticky top-0 left-0 right-0 bg-[#F9F7F3]/90 backdrop-blur-md z-40 h-[60px] flex items-center px-4 border-b border-[#E8E6E0] pt-[env(safe-area-inset-top)]">
                <h1 className="flex-1 text-center text-lg font-serif text-[#1C1C1C]">
                    Shopping Bag
                </h1>
            </header>

            {/* --- Main Content --- */}
            <main className="px-4 py-6 pb-40 space-y-6 max-w-lg mx-auto">
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
                                                        <span className="text-[#E8E6E0]">•</span>
                                                        <span>{item.selections.length}m</span>
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
