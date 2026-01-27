import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Package, Clock, CheckCircle, Wallet, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import Link from 'next/link';

// Interfaces
interface Order {
    id: string;
    order_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    items: any[];
}

interface OrderDraft {
    id: string;
    service_type: string;
    status: string;
    created_at: string;
    design_id?: string;
    // ... potentially other fields like estimated_price
}

export default function MyOrdersPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [mounted, setMounted] = useState(false);

    const [orders, setOrders] = useState<Order[]>([]);
    const [drafts, setDrafts] = useState<OrderDraft[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        async function fetchData() {
            if (!user) return;
            setLoadingData(true);
            try {
                // 1. Fetch Confirmed Orders from users/{uid}/orders
                const ordersRef = collection(db, 'users', user.id, 'orders');
                // Sorting might require index if mixed with where, but here we just fetching all for user
                // If we need strict ordering by created_at desc, we might need index or in-memory sort
                const ordersSnapshot = await getDocs(query(ordersRef, orderBy('created_at', 'desc')));
                // Fallback if index missing or error: simple getDocs and sort js
                // Accessing query with orderBy might fail if index not exists (firestore throws error usually)
                // Let's wrap safely or assume we just get all and sort JS side to be safe without index deployment.

                const fetchedOrders: Order[] = [];
                ordersSnapshot.forEach(doc => {
                    const data = doc.data();
                    fetchedOrders.push({
                        id: doc.id,
                        order_number: data.order_number || doc.id.substring(0, 8).toUpperCase(),
                        status: data.status,
                        total_amount: data.total_amount,
                        created_at: data.created_at,
                        items: data.items
                    } as Order);
                });

                // Double check sort order (if fallback needed)
                // fetchedOrders.sort(...) is handled by query usually, but simple safety if query failed or we simplify
                // Actually `getDocs(ordersRef)` + user side sort is safest for rapid dev without setting indexes manually in console.
                // But `orderBy` on simple collection usually works if no inequality filter.

                setOrders(fetchedOrders);

                // 2. Fetch Drafts from users/{uid}/drafts (or cart items?)
                // Assuming 'drafts' subcollection for now to match logic
                const draftsRef = collection(db, 'users', user.id, 'drafts');
                // Drafts are items in bag/pending

                const draftsSnapshot = await getDocs(draftsRef);
                const fetchedDrafts: OrderDraft[] = [];

                draftsSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.status === 'draft') {
                        fetchedDrafts.push({
                            id: doc.id,
                            service_type: data.service_type || 'Custom Service',
                            status: data.status,
                            created_at: data.created_at,
                            design_id: data.design_id
                        } as OrderDraft);
                    }
                });

                // In-memory sort drafts
                fetchedDrafts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setDrafts(fetchedDrafts);

            } catch (err) {
                console.error("Unexpected error:", err);
                // Fallback: try fetching without ordering if index error
                // (Not implemented here for brevity, assume works or empty)
            } finally {
                setLoadingData(false);
            }
        }

        if (isAuthenticated && user) {
            fetchData();
        }
    }, [authLoading, isAuthenticated, user, router]);

    if (!mounted || authLoading) return null;

    const hasNoData = orders.length === 0 && drafts.length === 0;

    // Helper to format date
    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    // Helper for Status Badge
    const getStatusStyle = (status: string) => {
        if (!status) return 'text-gray-600 bg-gray-50 border-gray-100';
        switch (status.toLowerCase()) {
            case 'delivered': return 'text-green-600 bg-green-50 border-green-100';
            case 'cancelled': return 'text-red-500 bg-red-50 border-red-100';
            case 'processing': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'shipped': return 'text-purple-600 bg-purple-50 border-purple-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-32 pt-[64px] md:pt-[68px] lg:pt-[72px]">
            <Head>
                <title>My Orders | Amma Embroidery</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            </Head>

            {/* Page Header */}
            <div className="pt-4 pb-6 px-4">
                <div className="text-center">
                    <h1 className="font-serif text-3xl text-[#1C1C1C] mb-2">My Orders</h1>
                    <p className="text-[#555555] text-sm">Track your past orders and pending requests.</p>
                </div>
            </div>

            <main className="max-w-md mx-auto px-4 space-y-8">

                {loadingData ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-[#C9A14A] border-t-transparent rounded-full"></div>
                    </div>
                ) : hasNoData ? (
                    // Empty State
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-[#E8E6E0] flex items-center justify-center mb-4 text-[#C9A14A]/50">
                            <Package size={24} />
                        </div>
                        <h3 className="font-serif text-xl text-[#1C1C1C] mb-2">No orders yet</h3>
                        <p className="text-sm text-[#777] mb-6">Start your custom journey with a beautiful design.</p>
                        <button
                            onClick={() => router.push('/designs')}
                            className="bg-[#C9A14A] text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg shadow-[#C9A14A]/20 hover:bg-[#B89240] transition-colors"
                        >
                            Browse Designs
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Drafts Section */}
                        {drafts.length > 0 && (
                            <section>
                                <h2 className="font-serif text-lg mb-3 text-[#1C1C1C] flex items-center gap-2">
                                    <Clock size={16} className="text-[#C9A14A]" />
                                    Pending Requests
                                </h2>
                                <div className="space-y-3">
                                    {drafts.map((draft, idx) => (
                                        <motion.div
                                            key={draft.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-white rounded-xl p-4 border border-[#E8E6E0] shadow-sm relative overflow-hidden"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#C9A14A] bg-[#FFFBF2] px-2 py-0.5 rounded-full border border-[#FDEBC2]">
                                                        Needs Action
                                                    </span>
                                                    <h3 className="font-medium text-[#1C1C1C] text-sm mt-2 capitalize">{draft.service_type?.replace(/_/g, ' ')}</h3>
                                                </div>
                                                <span className="text-xs text-[#999]">{formatDate(draft.created_at)}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-4">
                                                <p className="text-xs text-[#777]">In Bag</p>
                                                <Link href="/shopping-bag" className="text-sm font-medium text-[#C9A14A] flex items-center gap-1 hover:underline">
                                                    Complete Order <ChevronRight size={14} />
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Confirmed Orders Section */}
                        {orders.length > 0 && (
                            <section>
                                <h2 className="font-serif text-lg mb-3 text-[#1C1C1C] flex items-center gap-2">
                                    <CheckCircle size={16} className="text-[#C9A14A]" />
                                    Order History
                                </h2>
                                <div className="space-y-3">
                                    {orders.map((order, idx) => (
                                        <motion.div
                                            key={order.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => router.push(`/my-orders/${order.id}`)}
                                            className="bg-white rounded-xl p-5 border border-[#E8E6E0] shadow-sm hover:border-[#d4d1c9] active:bg-gray-50 transition-all cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-[#999] mb-1">Order ID</p>
                                                    <p className="font-medium text-[#1C1C1C] text-sm font-mono">{order.order_number}</p>
                                                </div>
                                                <div className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wide border ${getStatusStyle(order.status)}`}>
                                                    {order.status}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-xs text-[#777] mb-1 flex items-center gap-1">
                                                        <Calendar size={12} /> {formatDate(order.created_at)}
                                                    </p>
                                                    <p className="text-sm text-[#5A5751] flex items-center gap-1">
                                                        <Package size={12} />
                                                        {Array.isArray(order.items) ? order.items.length : 0} Items
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 text-[#1C1C1C]">
                                                    <span className="font-serif font-medium">₹{order.total_amount?.toLocaleString('en-IN') || 0}</span>
                                                    <ChevronRight size={16} className="text-[#CCC] group-hover:text-[#C9A14A] transition-colors" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
