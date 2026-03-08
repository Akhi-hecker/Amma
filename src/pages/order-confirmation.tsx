import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Check, CheckCircle, Clock, Truck, Package, Download, ChevronRight, MapPin, CreditCard, ShoppingBag } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// --- Types ---
interface OrderItem {
    id: string;
    name: string;
    service: string;
    fabric?: string;
    color?: string;
    length?: number;
    price: number;
    image?: string;
    _displayDetails?: any;
}

interface OrderAddress {
    name: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
}

interface OrderDetails {
    id: string;
    order_number?: string;
    date: any;
    total: number;
    payment_method: string;
    address?: OrderAddress;
    items: OrderItem[];
    status: string;
}

// --- Steps Configuration ---
const PROGRESS_STEPS = [
    { label: 'Order Received', icon: CheckCircle },
    { label: 'In Production', icon: Clock },
    { label: 'Quality Check', icon: CheckCircle },
    { label: 'Shipped', icon: Truck },
    { label: 'Delivered', icon: Package }
];

export default function OrderConfirmationPage() {
    const router = useRouter();
    const { orderId } = router.query;
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [order, setOrder] = useState<OrderDetails | null>(null);

    // --- Data Fetching ---
    useEffect(() => {
        setMounted(true);

        const fetchOrder = async (uid: string, id: string) => {
            try {
                let docRef = doc(db, 'users', uid, 'orders', id);
                let docSnap = await getDoc(docRef);

                // Fallback: Check global orders collection if not found in custom subcollection
                if (!docSnap.exists()) {
                    docRef = doc(db, 'orders', id);
                    docSnap = await getDoc(docRef);
                }

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setOrder({
                        id: docSnap.id,
                        order_number: data.order_number,
                        date: data.created_at, // Timestamp or string
                        total: data.total_amount || data.total || 0,
                        payment_method: data.payment_method || 'Online Payment',
                        status: data.status || 'Order Received',
                        address: data.shipping_address ? {
                            name: data.shipping_address.fullName,
                            line1: data.shipping_address.addressLine1,
                            city: data.shipping_address.city,
                            state: data.shipping_address.state,
                            pincode: data.shipping_address.pincode
                        } : (data.address ? {
                            name: data.address.full_name,
                            line1: data.address.address_line1,
                            city: data.address.city,
                            state: data.address.state,
                            pincode: data.address.pincode
                        } : undefined),
                        items: (data.items || []).map((item: any) => ({
                            id: item.id,
                            name: item.name || item.designName || 'Custom Item',
                            service: item.service || item.serviceType || 'Embroidery',
                            price: item.price,
                            image: item.image || item.designImage,
                            fabric: item.fabric || item.selections?.fabric,
                            color: item.color || item.selections?.color,
                            length: item.length || item.selections?.length, // Fallback for fabric length
                            qty: item.qty || item.quantity || 1,
                            _displayDetails: item._displayDetails || {
                                fabricName: item.selections?.fabric,
                                colorName: item.selections?.color,
                                length: item.selections?.length
                            }
                        }))
                    });
                }
            } catch (err) {
                console.error("Error fetching order:", err);
            } finally {
                setIsLoading(false);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && orderId) {
                fetchOrder(user.uid, orderId as string);
            } else if (!user && orderId) {
                setIsLoading(false);
            } else {
                if (router.isReady && !orderId) setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, [orderId, router.isReady]);


    // --- Helpers ---
    const getEstimatedDelivery = (date: any) => {
        if (!date) return '7-10 Days';
        const d = new Date(date);
        d.setDate(d.getDate() + 10);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getFormatDate = (date: any) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-40 pt-[64px] md:pt-[72px]">
            <Head>
                <title>Order Confirmed | Amma Embroidery</title>
            </Head>

            {/* Title Bar */}
            <div className="bg-white border-b border-[#E8E6E0] py-4 text-center sticky top-0 z-40">
                <h1 className="font-serif text-xl text-[#1C1C1C]">Order Confirmed</h1>
            </div>

            <main className="max-w-md mx-auto px-4 py-8 space-y-8">

                {/* --- Success Section --- */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ease: "easeOut", duration: 0.5 }}
                    className="flex flex-col items-center text-center mt-8 mb-4"
                >
                    <div className="w-16 h-16 bg-[#1C1C1C] rounded-none flex items-center justify-center mb-6">
                        <Check size={32} className="text-white" strokeWidth={2} />
                    </div>
                    <h2 className="font-serif text-2xl text-[#1C1C1C] leading-tight mb-3">
                        Your Order Has Been<br />Placed Successfully!
                    </h2>
                    <p className="text-[#5A5751] text-xs leading-relaxed max-w-[280px]">
                        Thank you for choosing Amma Embroidery. Our artisans will begin work soon.
                    </p>
                </motion.div>


                {/* --- Loading State / content --- */}
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-2 border-[#1C1C1C] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : order ? (
                    <>
                        {/* --- Order Details Card --- */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-none border border-[#E8E6E0] overflow-hidden"
                        >
                            <div className="p-5 grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                <div>
                                    <p className="text-[10px] uppercase text-[#999] tracking-wider mb-1">Order ID</p>
                                    <p className="font-medium text-[#1C1C1C] truncate">{order.order_number || order.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase text-[#999] tracking-wider mb-1">Date</p>
                                    <p className="font-medium text-[#1C1C1C]">{getFormatDate(order.date)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-[#999] tracking-wider mb-1">Est. Delivery</p>
                                    <p className="font-medium text-[#1C1C1C]">{getEstimatedDelivery(order.date)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase text-[#999] tracking-wider mb-1">Total</p>
                                    <p className="font-serif text-lg text-[#1C1C1C]">₹{order.total.toLocaleString()}</p>
                                </div>

                                <div className="col-span-2 pt-4 border-t border-[#E8E6E0] mt-2 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <CreditCard size={14} className="text-[#1C1C1C] stroke-[1.5]" />
                                        <span className="text-[10px] uppercase tracking-wider text-[#1C1C1C] font-medium">{order.payment_method}</span>
                                    </div>
                                    {order.address && (
                                        <div className="flex items-center gap-2 max-w-[60%] justify-end">
                                            <MapPin size={14} className="text-[#1C1C1C] stroke-[1.5] flex-shrink-0" />
                                            <span className="text-xs text-[#5A5751] truncate">{order.address.city}, {order.address.pincode}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* --- Order Items Section --- */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-4"
                        >
                            <h3 className="font-serif text-lg text-[#1C1C1C] px-1 border-b border-[#E8E6E0] pb-2">Items Ordered</h3>
                            <div className="bg-white rounded-none border border-[#E8E6E0] divide-y divide-[#E8E6E0]">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="p-4 flex gap-4">
                                        <div className="w-16 h-20 bg-[#F9F7F3] rounded-none flex-shrink-0 overflow-hidden relative">
                                            <div className={`absolute inset-0 ${item.image || 'bg-gray-200'} opacity-50`} />
                                        </div>
                                        <div className="flex-1 min-w-0 py-0.5">
                                            <h4 className="font-serif text-sm text-[#1C1C1C] mb-1 truncate">{item.name}</h4>
                                            <p className="text-[10px] uppercase tracking-wider text-[#999] mb-1.5">{item.service}</p>

                                            <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-[#5A5751]">
                                                {/* Try to extract fabric/color from bag _displayDetails or fallback */}
                                                <span>{item._displayDetails?.fabricName || item.fabric || 'Fabric'}</span>
                                                <span className="text-[#E8E6E0]">|</span>
                                                <span>{item._displayDetails?.colorName || item.color || 'Color'}</span>
                                            </div>
                                        </div>
                                        <div className="py-0.5 text-right flex flex-col items-end">
                                            <p className="text-sm font-medium text-[#1C1C1C]">₹{item.price.toLocaleString()}</p>
                                            <p className="text-[10px] uppercase tracking-wider text-[#999] mt-1">{item._displayDetails?.length ? `${item._displayDetails.length}m` : 'Qty: 1'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* --- Progress Indicator --- */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-none border border-[#E8E6E0] p-6"
                        >
                            <h3 className="font-serif text-lg text-[#1C1C1C] mb-6">Order Tracking</h3>
                            <div className="relative pl-3">
                                {/* Connector Line */}
                                <div className="absolute left-[15px] top-3 bottom-5 w-[1px] bg-[#E8E6E0]" />

                                <div className="space-y-6">
                                    {PROGRESS_STEPS.map((step, idx) => {
                                        // Simple logic: First step is active for new order
                                        const isActive = idx === 0;

                                        return (
                                            <div key={idx} className="relative flex items-center gap-5">
                                                <div className={`
                                                    relative z-10 w-4 h-4 rounded-none border flex items-center justify-center bg-white shrink-0
                                                    ${isActive ? 'border-[#1C1C1C] bg-[#1C1C1C]' : 'border-[#E8E6E0]'}
                                                `}>
                                                    {isActive && <Check size={10} className="text-white" strokeWidth={3} />}
                                                </div>
                                                <div className={`${isActive ? 'opacity-100' : 'opacity-50'}`}>
                                                    <p className={`text-[11px] uppercase tracking-wide font-medium ${isActive ? 'text-[#1C1C1C]' : 'text-[#777]'}`}>{step.label}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </motion.div>

                        {/* --- Trust Message --- */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-center bg-[#F9F7F3] p-5 border border-[#E8E6E0]"
                        >
                            <p className="text-[10px] text-[#5A5751] uppercase tracking-wider leading-relaxed font-medium">
                                Each piece is crafted with precision. You will receive updates via SMS/email as your order progresses.
                            </p>
                        </motion.div>

                    </>
                ) : (
                    // Fallback for not found or guest
                    <div className="text-center py-10">
                        <ShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900">Order not found</h3>
                        <p className="text-sm text-gray-500 mt-2">Could not retrieve order details.</p>
                    </div>
                )}
            </main>

            {/* --- Action Buttons --- */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E8E6E0] shadow-none z-50 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <div className="max-w-md mx-auto flex flex-col gap-3">
                    <button
                        onClick={() => router.push(orderId ? `/my-orders/${orderId}` : '/my-orders')}
                        className="w-full py-4 rounded-none bg-[#1C1C1C] text-white font-medium text-[10px] uppercase tracking-widest hover:bg-[#333] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span>Track Order</span>
                        <ChevronRight size={14} />
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => router.push('/designs')}
                            className="py-3.5 rounded-none border border-[#E8E6E0] text-[#1C1C1C] font-medium text-[10px] uppercase tracking-widest hover:bg-[#F9F7F3] active:scale-[0.98] transition-colors"
                        >
                            Continue Shopping
                        </button>
                        <button
                            // Invoice logic would go here
                            className="py-3.5 rounded-none border border-[#E8E6E0] text-[#1C1C1C] font-medium text-[10px] uppercase tracking-widest hover:bg-[#F9F7F3] active:scale-[0.98] transition-colors flex items-center justify-center gap-2"
                        >
                            <Download size={14} className="stroke-[1.5]" />
                            <span>Invoice</span>
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
