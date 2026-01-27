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
                const docRef = doc(db, 'users', user.id, 'orders', orderId as string);
                const docSnap = await getDoc(docRef);

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
                        items: data.items || [],
                        address: data.address ? {
                            name: data.address.full_name || user.name || 'User',
                            line1: data.address.address_line1 || '',
                            city: data.address.city || '',
                            state: data.address.state || '',
                            pincode: data.address.pincode || ''
                        } : undefined,
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
                <h1 className="flex-1 text-center text-2xl font-serif text-[#1C1C1C]">
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
                    <div className="bg-white rounded-xl p-5 border border-[#E8E6E0] shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-[#999] mb-1">Order ID</p>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-[#1C1C1C] text-sm tracking-wide">{order.order_number || order.id.substring(0, 8).toUpperCase()}</span>
                                    {/* Copy Logic would go here */}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase tracking-wider text-[#999] mb-1">Total</p>
                                <p className="font-serif font-medium text-[#1C1C1C]">₹{order.total.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#5A5751] pt-3 border-t border-[#E8E6E0] border-dashed">
                            {order.address ? (
                                <>
                                    <MapPin size={14} className="text-[#999]" />
                                    <span>{order.address.name}, {order.address.city}</span>
                                </>
                            ) : (
                                <span className="text-gray-400">No address details available</span>
                            )}
                        </div>
                    </div>

                    {/* --- Tracking Timeline --- */}
                    <section className="bg-white rounded-xl p-6 border border-[#E8E6E0] shadow-sm">
                        <h2 className="font-serif text-lg text-[#1C1C1C] mb-6">Order Status</h2>
                        <div className="relative">
                            {/* Vertical Line - Centered for 24px (w-6) marker */}
                            <div className="absolute left-[11.5px] top-4 bottom-4 w-[1px] bg-[#E8E6E0] z-0" />

                            <div className="space-y-8">
                                {TRACKING_STEPS.map((step, idx) => {
                                    const isCompleted = idx < currentStepIndex;
                                    const isCurrent = idx === currentStepIndex;
                                    const isFuture = idx > currentStepIndex;

                                    return (
                                        <div key={idx} className="relative flex items-start gap-4">
                                            {/* Icon/Dot */}
                                            <div className={`
                                                relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ring-4 ring-white
                                                ${isCompleted || isCurrent ? 'bg-[#C9A14A] text-white' : 'bg-[#E8E6E0] text-gray-400'}
                                            `}>
                                                {isCurrent ? (
                                                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                                                ) : (
                                                    <span className="text-[10px] font-bold">
                                                        {isCompleted ? <CheckCircle size={14} /> : idx + 1}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Text */}
                                            <div className={`pt-0.5 ${isFuture ? 'opacity-40' : 'opacity-100'}`}>
                                                <h4 className={`text-sm font-medium ${isCurrent ? 'text-[#C9A14A]' : 'text-[#1C1C1C]'}`}>
                                                    {step.title}
                                                </h4>
                                                {isCurrent && (
                                                    <p className="text-xs text-[#777] mt-0.5">We are currently working on this step.</p>
                                                )}
                                                {step.title === 'Shipped' && isCompleted && order.tracking && (
                                                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                                                        <p className="text-[#5A5751] mb-1">Courier: <span className="font-medium text-[#1C1C1C]">{order.tracking.courier}</span></p>
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
                    <div className="bg-white rounded-xl overflow-hidden border border-[#E8E6E0]">
                        <div className="px-5 py-3 border-b border-[#E8E6E0] bg-gray-50/50">
                            <h3 className="text-xs font-semibold text-[#5A5751] uppercase tracking-wide">Items Ordered</h3>
                        </div>
                        <div className="p-2">
                            {order.items.map((item, index) => (
                                <div key={item.id || index} className="flex gap-3 p-3 border-b border-[#E8E6E0] last:border-0 hover:bg-gray-50 transition-colors">
                                    <div className={`w-12 h-14 ${item.image || 'bg-gray-200'} rounded flex-shrink-0 opacity-80`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#1C1C1C]">{item.name}</p>
                                        <p className="text-[10px] text-[#777] uppercase tracking-wide mt-0.5">{item.service}</p>
                                        <p className="text-xs text-[#5A5751] mt-1">
                                            {item.isFabric ? `${item.qty}m` : `Qty: ${item.qty}`}
                                        </p>
                                    </div>
                                    <div className="text-xs font-medium text-[#1C1C1C]">
                                        ₹{item.price?.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </main>
            )}

            {/* --- Detail Page Actions --- */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-[#E8E6E0] pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-[#E8E6E0] text-[#5A5751] font-medium text-xs hover:bg-gray-50 active:scale-[0.98] transition-all">
                        <FileText size={16} />
                        Invoice
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-[#E8E6E0] text-[#5A5751] font-medium text-xs hover:bg-gray-50 active:scale-[0.98] transition-all">
                        <MessageCircle size={16} />
                        Support
                    </button>
                    {order && order.status === 'Shipped' && (
                        <button className="col-span-2 py-3.5 rounded-xl bg-[#C9A14A] text-white font-medium text-sm shadow-lg shadow-[#C9A14A]/30 active:scale-[0.98] transition-all">
                            Track Shipment
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
}
