
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Package, MapPin, Truck, CheckCircle, Clock, Copy, MessageCircle, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// --- Types ---
type OrderStatus = 'Order Confirmed' | 'Embroidery in Progress' | 'Quality Check' | 'Shipped' | 'Delivered';

// --- Mock Data Generator ---
const getOrderDetails = (id: string) => ({
    id: id || 'ORD-2026-8892',
    date: 'Jan 14, 2026',
    total: 3850,
    status: 'Embroidery in Progress' as OrderStatus,
    paymentMethod: 'UPI',
    items: [
        {
            id: '1',
            name: 'Royal Peacock Motif',
            service: 'Embroidery Cloth Only',
            desc: 'Raw Silk • Crimson Red',
            qty: 2.5,
            isFabric: true,
            image: 'bg-red-900',
            price: 3000
        },
        {
            id: '2',
            name: 'Lotus Border Work',
            service: 'Customization',
            desc: 'Sleeve Embroidery',
            qty: 1,
            isFabric: false,
            image: 'bg-pink-700',
            price: 850
        }
    ],
    address: {
        name: 'Ananya Rao',
        line1: 'Flat 402, Sunshine Apartments',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500032'
    },
    tracking: {
        courier: 'BlueDart',
        number: 'BD123456789',
        url: '#'
    }
});

const TRACKING_STEPS = [
    { title: 'Order Confirmed', icon: CheckCircle },
    { title: 'Embroidery in Progress', icon: Clock },
    { title: 'Quality Check', icon: CheckCircle },
    { title: 'Shipped', icon: Truck },
    { title: 'Delivered', icon: Package }
];

export default function OrderDetailPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const { orderId } = router.query;
    const [mounted, setMounted] = useState(false);
    const [order, setOrder] = useState<ReturnType<typeof getOrderDetails> | null>(null);

    useEffect(() => {
        setMounted(true);
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (orderId) {
            // Simulate Fetch
            setTimeout(() => {
                setOrder(getOrderDetails(orderId as string));
            }, 500);
        }
    }, [orderId, isLoading, isAuthenticated, router]);

    if (!mounted || !orderId || isLoading || !isAuthenticated) return null;

    // Helper to determine step status
    const getCurrentStepIndex = (status: OrderStatus) => TRACKING_STEPS.findIndex(s => s.title === status);

    // For Demo: Use mock status from order object
    const currentStepIndex = order ? getCurrentStepIndex(order.status) : 0;

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

            {!order ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin w-6 h-6 border-2 border-[#C9A14A]/30 border-t-[#C9A14A] rounded-full"></div>
                </div>
            ) : (
                <main className="max-w-md mx-auto px-4 py-6 space-y-6">

                    {/* --- Order Summary Header --- */}
                    <div className="bg-white rounded-xl p-5 border border-[#E8E6E0] shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-[#999] mb-1">Order ID</p>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-[#1C1C1C] text-sm tracking-wide">{order.id}</span>
                                    {/* Copy Logic would go here */}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase tracking-wider text-[#999] mb-1">Total</p>
                                <p className="font-serif font-medium text-[#1C1C1C]">₹{order.total.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#5A5751] pt-3 border-t border-[#E8E6E0] border-dashed">
                            <MapPin size={14} className="text-[#999]" />
                            <span>{order.address.name}, {order.address.city}</span>
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
                                                {step.title === 'Shipped' && isCompleted && (
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
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-3 p-3 border-b border-[#E8E6E0] last:border-0 hover:bg-gray-50 transition-colors">
                                    <div className={`w-12 h-14 ${item.image} rounded bg-gray-200 flex-shrink-0 opacity-80`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#1C1C1C]">{item.name}</p>
                                        <p className="text-[10px] text-[#777] uppercase tracking-wide mt-0.5">{item.service}</p>
                                        <p className="text-xs text-[#5A5751] mt-1">
                                            {item.isFabric ? `${item.qty}m` : `Qty: ${item.qty}`}
                                        </p>
                                    </div>
                                    <div className="text-xs font-medium text-[#1C1C1C]">
                                        ₹{item.price.toLocaleString()}
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
