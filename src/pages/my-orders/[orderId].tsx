import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Package, MapPin, Truck, CheckCircle, Clock, Copy, MessageCircle, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// --- Types ---
type OrderStatus = 'Order Confirmed' | 'Embroidery in Progress' | 'Quality Check' | 'Shipped' | 'Delivered' | 'Pending' | 'Cancelled';

interface OrderItem {
    id: string;
    name: string;
    service: string;
    desc?: string;
    qty: number;
    isFabric?: boolean;
    image?: string;
    price: number;
}

interface OrderAddress {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
}

interface OrderTracking {
    courier?: string;
    number?: string;
    url?: string;
}

interface OrderDetails {
    id: string;
    order_number?: string;
    date: string; // ISO string or timestamp
    total: number;
    status: OrderStatus;
    paymentMethod?: string;
    items: OrderItem[];
    address?: OrderAddress;
    tracking?: OrderTracking;
}

const TRACKING_STEPS = [
    { title: 'Order Confirmed', icon: CheckCircle },
    { title: 'Embroidery in Progress', icon: Clock },
    { title: 'Quality Check', icon: CheckCircle },
    { title: 'Shipped', icon: Truck },
    { title: 'Delivered', icon: Package }
];

export default function OrderDetailPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAuth();
    const { orderId } = router.query;
    const [mounted, setMounted] = useState(false);
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [fetchLoading, setFetchLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        async function fetchOrder() {
            if (!user || !orderId) return;
            setFetchLoading(true);

            try {
                let docRef = doc(db, 'users', user.id, 'orders', orderId as string);
                let docSnap = await getDoc(docRef);

                // Fallback: Check global orders collection
                if (!docSnap.exists()) {
                    docRef = doc(db, 'orders', orderId as string);
                    docSnap = await getDoc(docRef);
                }

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Transform Firestore data to component state
                    const fetchedOrder: OrderDetails = {
                        id: docSnap.id,
                        order_number: data.order_number || docSnap.id,
                        date: data.created_at,
                        total: data.total_amount || 0,
                        status: data.status || 'Order Confirmed',
                        paymentMethod: data.payment_method || 'Online',
                        items: (data.items || []).map((item: any) => ({
                            id: item.id,
                            name: item.name || item.designName || 'Custom Item',
                            service: item.service || item.serviceType || 'Embroidery',
                            desc: item.desc,
                            qty: item.qty || item.quantity || 1,
                            isFabric: item.isFabric,
                            image: item.image || item.designImage,
                            price: item.price
                        })),
                        address: data.shipping_address ? {
                            name: data.shipping_address.fullName,
                            line1: data.shipping_address.addressLine1,
                            city: data.shipping_address.city,
                            state: data.shipping_address.state,
                            pincode: data.shipping_address.pincode
                        } : (data.address ? {
                            name: data.address.full_name || user.name || 'User',
                            line1: data.address.address_line1 || '',
                            city: data.address.city || '',
                            state: data.address.state || '',
                            pincode: data.address.pincode || ''
                        } : undefined),
                        tracking: data.tracking
                    };
                    setOrder(fetchedOrder);
                } else {
                    console.log("No such order!");
                    // Handle not found (optional redirect or show error)
                }
            } catch (err) {
                console.error("Error fetching order:", err);
            } finally {
                setFetchLoading(false);
            }
        }

        if (isAuthenticated && user && orderId) {
            fetchOrder();
        }
    }, [orderId, isLoading, isAuthenticated, router, user]);

    if (!mounted || !orderId || isLoading || !isAuthenticated) return null;

    // Helper to determine step status (simplified mapping for variable statuses)
    const getCurrentStepIndex = (status: OrderStatus | string) => {
        // Map backend status to timeline step
        // Fallback for custom or mismatch
        const title = TRACKING_STEPS.find(s => s.title.toLowerCase() === status.toLowerCase())?.title;
        if (title) return TRACKING_STEPS.findIndex(s => s.title === title);

        // Approximate mappings
        if (status.toLowerCase().includes('progress')) return 1;
        if (status.toLowerCase().includes('quality')) return 2;
        if (status.toLowerCase().includes('shipped')) return 3;
        if (status.toLowerCase().includes('delivered')) return 4;
        return 0; // Default to Confirmed
    };

    const currentStepIndex = order ? getCurrentStepIndex(order.status) : 0;
    const orderDateFormatted = order ? new Date(order.date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    }) : '';

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-32 pt-[64px] md:pt-[68px] lg:pt-[72px]">
            <Head>
                <title>Order Details | Amma Embroidery</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            </Head>

            {/* --- Local Header (Scrolls with page) --- */}
            <header className="w-full bg-[#F9F7F3] h-[90px] flex items-center px-4 pt-6">
                <h1 className="flex-1 text-center text-3xl font-serif font-light text-[#1C1C1C] tracking-wide">
                    Order Details
                </h1>
            </header>

            {fetchLoading && !order ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin w-6 h-6 border-2 border-[#C9A14A]/30 border-t-[#C9A14A] rounded-full"></div>
                </div>
            ) : !order ? (
                <div className="text-center py-20 text-gray-500">Order not found.</div>
            ) : (
                <main className="max-w-md mx-auto px-4 py-6 space-y-6">

                    {/* --- Order Summary Header --- */}
                    <div className="bg-white rounded-none p-6 border border-[#E8E6E0] shadow-none">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#999] mb-2">Order ID</p>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-[#1C1C1C] text-sm font-mono tracking-wider">{order.order_number || order.id.substring(0, 8).toUpperCase()}</span>
                                    {/* Copy Logic would go here */}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#999] mb-2">Total</p>
                                <p className="font-serif font-light text-xl text-[#1C1C1C]">₹{order.total.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] text-[#5A5751] pt-4 border-t border-[#E8E6E0] border-dashed">
                            {order.address ? (
                                <>
                                    <MapPin size={14} strokeWidth={1.5} className="text-[#999]" />
                                    <span>{order.address.name}, {order.address.city}</span>
                                </>
                            ) : (
                                <span className="text-gray-400">No address details available</span>
                            )}
                        </div>
                    </div>

                    {/* --- Tracking Timeline --- */}
                    <section className="bg-white rounded-none p-8 border border-[#E8E6E0] shadow-none">
                        <h2 className="font-serif text-2xl font-light text-[#1C1C1C] mb-8 tracking-wide">Order Status</h2>
                        <div className="relative">
                            {/* Vertical Line - Centered for 24px (w-6) marker */}
                            <div className="absolute left-[11.5px] top-4 bottom-4 w-[1px] bg-[#E8E6E0] z-0" />

                            <div className="space-y-10">
                                {TRACKING_STEPS.map((step, idx) => {
                                    const isCompleted = idx < currentStepIndex;
                                    const isCurrent = idx === currentStepIndex;
                                    const isFuture = idx > currentStepIndex;

                                    return (
                                        <div key={idx} className="relative flex items-start gap-4">
                                            {/* Icon/Dot */}
                                            <div className={`
                                                relative z-10 w-6 h-6 rounded-none flex items-center justify-center transition-colors duration-300 ring-4 ring-white
                                                ${isCompleted || isCurrent ? 'bg-[#1C1C1C] text-white' : 'bg-[#E8E6E0] text-transparent'}
                                            `}>
                                                {isCurrent ? (
                                                    <div className="w-2.5 h-2.5 bg-white rounded-none animate-pulse" />
                                                ) : (
                                                    <span className="text-[10px] font-bold">
                                                        {isCompleted ? <CheckCircle size={14} strokeWidth={1.5} /> : ''}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Text */}
                                            <div className={`pt-0.5 ${isFuture ? 'opacity-40' : 'opacity-100'}`}>
                                                <h4 className={`text-[11px] uppercase tracking-[0.1em] font-medium ${isCurrent ? 'text-[#1C1C1C]' : 'text-[#5A5751]'}`}>
                                                    {step.title}
                                                </h4>
                                                {isCurrent && (
                                                    <p className="text-[10px] text-[#999] mt-1 italic">We are currently working on this step.</p>
                                                )}
                                                {step.title === 'Shipped' && isCompleted && order.tracking && (
                                                    <div className="mt-3 p-4 bg-[#F9F7F3] rounded-none border border-[#E8E6E0] text-[10px] uppercase tracking-[0.1em]">
                                                        <p className="text-[#5A5751] mb-2">Courier: <span className="font-medium text-[#1C1C1C]">{order.tracking.courier}</span></p>
                                                        <p className="text-[#5A5751]">Tracking: <span className="font-medium text-[#1C1C1C]">{order.tracking.number}</span></p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* --- Order Items (Compact) --- */}
                    <div className="bg-white rounded-none overflow-hidden border border-[#E8E6E0]">
                        <div className="px-6 py-4 border-b border-[#E8E6E0] bg-[#F9F7F3]">
                            <h3 className="text-[9px] font-medium text-[#1C1C1C] uppercase tracking-[0.2em]">Items Ordered</h3>
                        </div>
                        <div className="p-2">
                            {order.items.map((item, index) => (
                                <div key={item.id || index} className="flex gap-4 p-4 border-b border-[#E8E6E0] last:border-0 hover:bg-[#F9F7F3] transition-colors">
                                    <div className={`w-14 h-16 ${item.image || 'bg-[#E8E6E0]'} rounded-none flex-shrink-0 opacity-80`} />
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <p className="text-sm font-medium text-[#1C1C1C]">{item.name}</p>
                                        <p className="text-[9px] text-[#999] uppercase tracking-[0.2em] mt-1">{item.service}</p>
                                        <p className="text-[10px] text-[#5A5751] mt-2">
                                            {item.isFabric ? `${item.qty}m` : `Qty: ${item.qty}`}
                                        </p>
                                    </div>
                                    <div className="text-sm font-medium text-[#1C1C1C] flex items-center">
                                        ₹{item.price?.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </main>
            )}

            {/* --- Detail Page Actions --- */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-[#E8E6E0] pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-none z-50">
                <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 py-4 rounded-none border border-[#E8E6E0] text-[#1C1C1C] font-medium text-[10px] uppercase tracking-[0.2em] hover:bg-[#F9F7F3] active:scale-[0.98] transition-all">
                        <FileText size={16} strokeWidth={1.5} />
                        Invoice
                    </button>
                    <button className="flex items-center justify-center gap-2 py-4 rounded-none border border-[#E8E6E0] text-[#1C1C1C] font-medium text-[10px] uppercase tracking-[0.2em] hover:bg-[#F9F7F3] active:scale-[0.98] transition-all">
                        <MessageCircle size={16} strokeWidth={1.5} />
                        Support
                    </button>
                    {order && order.status === 'Shipped' && (
                        <button className="col-span-2 py-4 rounded-none bg-[#1C1C1C] text-white font-medium text-[11px] tracking-[0.2em] uppercase shadow-none hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] hover:bg-black active:scale-[0.98] transition-all">
                            Track Shipment
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
}
