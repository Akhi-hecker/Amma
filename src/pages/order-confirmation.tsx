
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Check, CreditCard, MessageCircle } from 'lucide-react';

const MOCK_ORDER = {
    id: 'ORD-2026-8892',
    date: 'Jan 14, 2026',
    total: 3850,
    method: 'UPI',
    items: [
        {
            id: '1',
            name: 'Royal Peacock Motif',
            service: 'Embroidery Cloth Only',
            desc: 'Raw Silk • Crimson Red',
            qty: 2.5, // meters
            isFabric: true,
            image: 'bg-red-900' // Placeholder class
        },
        {
            id: '2',
            name: 'Lotus Border Work',
            service: 'Customization',
            desc: 'Sleeve Embroidery',
            qty: 1,
            isFabric: false,
            image: 'bg-pink-700'
        }
    ]
};

export default function OrderConfirmationPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-32 pt-[64px] md:pt-[68px] lg:pt-[72px]">
            <Head>
                <title>Order Confirmed | Amma Embroidery</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            </Head>

            {/* --- Local Header (Scrolls with page) --- */}
            <header className="w-full bg-[#F9F7F3] h-[100px] flex items-center justify-center px-4 pt-8">
                <h1 className="font-serif text-3xl text-[#1C1C1C]">Order Confirmed</h1>
            </header>

            <main className="max-w-md mx-auto px-5 py-8 space-y-10">

                {/* --- Success Indicator --- */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col items-center text-center"
                >
                    <div className="w-20 h-20 rounded-full bg-[#C9A14A]/10 flex items-center justify-center mb-6 ring-1 ring-[#C9A14A]/20">
                        <Check size={40} className="text-[#C9A14A]" strokeWidth={2.5} />
                    </div>
                    <h2 className="font-serif text-2xl text-[#1C1C1C] mb-2">
                        Thank you for your order
                    </h2>
                    <p className="text-[#5A5751] text-sm leading-relaxed max-w-[280px]">
                        Your embroidery order has been successfully placed. We're excited to craft this for you.
                    </p>
                </motion.div>

                {/* --- Order Details Card --- */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white rounded-xl border border-[#E8E6E0] overflow-hidden shadow-sm"
                >
                    {/* Header Info */}
                    <div className="p-5 border-b border-[#E8E6E0] grid grid-cols-2 gap-y-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-[#999] mb-1">Order ID</p>
                            <p className="text-sm font-medium text-[#1C1C1C]">{MOCK_ORDER.id}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider text-[#999] mb-1">Date</p>
                            <p className="text-sm font-medium text-[#1C1C1C]">{MOCK_ORDER.date}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-[#999] mb-1">Total Amount</p>
                            <p className="text-sm font-medium text-[#1C1C1C]">₹{MOCK_ORDER.total.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider text-[#999] mb-1">Payment</p>
                            <div className="flex items-center justify-end gap-1.5">
                                <CreditCard size={12} className="text-[#5A5751]" />
                                <p className="text-sm font-medium text-[#1C1C1C]">{MOCK_ORDER.method}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="bg-[#FAFAFA] px-5 py-4 space-y-4">
                        {MOCK_ORDER.items.map((item) => (
                            <div key={item.id} className="flex gap-3">
                                <div className={`w-10 h-12 ${item.image} rounded bg-gray-200 flex-shrink-0 opacity-80`} />
                                <div className="flex-1 min-w-0 flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-[#1C1C1C] leading-snug">{item.name}</p>
                                        <p className="text-[11px] text-[#777] mt-0.5">{item.service}</p>
                                    </div>
                                    <span className="text-xs text-[#5A5751] font-medium bg-white px-1.5 py-0.5 rounded border border-[#E8E6E0]">
                                        {item.isFabric ? `${item.qty}m` : `x${item.qty}`}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* --- What Happens Next --- */}
                <section className="pt-4">
                    <h3 className="font-serif text-xl text-[#1C1C1C] mb-8 relative inline-block">
                        What happens next?
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '40px' }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="absolute -bottom-2 left-0 h-[2px] bg-[#C9A14A]"
                        />
                    </h3>

                    <div className="relative space-y-10">
                        {/* Vertical Progress Line */}
                        <div className="absolute left-[13px] top-6 bottom-6 w-[1px] bg-gradient-to-b from-[#C9A14A] via-[#E8E6E0] to-[#E8E6E0] z-0" />

                        {[
                            { title: 'Artisan Review', desc: 'Our team meticulously reviews your fabric selection & embroidery parameters.', active: true, delay: 0.4 },
                            { title: 'Hand-Crafting', desc: 'Skilled artisans begin the intricate embroidery process on our high-precision machines.', active: false, delay: 0.5 },
                            { title: 'Quality Assurance', desc: 'Every stitch is inspected under specialized lighting to ensure zero defects.', active: false, delay: 0.6 },
                            { title: 'Bespoke Packaging', desc: 'Your order is wrapped in premium tissue and secured for transit.', active: false, delay: 0.7 },
                        ].map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: step.delay }}
                                className="relative pl-10 group"
                            >
                                {/* Marker indicator */}
                                <div className="absolute left-0 top-0 flex flex-col items-center z-10">
                                    <div className={`
                                        w-[27px] h-[27px] rounded-full border flex items-center justify-center transition-all duration-500
                                        ${step.active
                                            ? 'border-[#C9A14A] bg-white shadow-[0_0_15px_rgba(201,161,74,0.15)] ring-4 ring-[#C9A14A]/10'
                                            : 'border-[#E8E6E0] bg-[#F9F7F3] group-hover:border-[#C9A14A]/50'}
                                    `}>
                                        <div className={`
                                            w-[9px] h-[9px] rounded-full transition-colors duration-500
                                            ${step.active ? 'bg-[#C9A14A]' : 'bg-[#E8E6E0] group-hover:bg-[#C9A14A]/30'}
                                        `} />
                                    </div>
                                </div>

                                <div className="pt-0.5">
                                    <h4 className={`
                                        font-serif text-base transition-colors duration-300
                                        ${step.active ? 'text-[#1C1C1C]' : 'text-[#999]'}
                                    `}>
                                        {step.title}
                                    </h4>
                                    <p className={`
                                        text-xs mt-1.5 leading-relaxed transition-colors duration-300 max-w-[280px]
                                        ${step.active ? 'text-[#5A5751]' : 'text-[#BBB]'}
                                    `}>
                                        {step.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* --- Support --- */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex flex-col items-center gap-3 pt-4"
                >
                    <p className="text-xs text-[#999]">Have questions about your order?</p>
                    <button className="flex items-center gap-2 text-sm text-[#5A5751] hover:text-[#C9A14A] transition-colors">
                        <MessageCircle size={16} />
                        <span>Contact Support</span>
                    </button>
                </motion.div>

            </main>

            {/* --- Bottom Actions --- */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-[#E8E6E0] pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-md mx-auto flex flex-col gap-3">
                    <button
                        onClick={() => router.push('/designs')}
                        className="w-full py-3.5 rounded-xl bg-[#C9A14A] text-white font-medium text-sm shadow-lg shadow-[#C9A14A]/30 active:scale-[0.98] transition-all"
                    >
                        Continue Browsing
                    </button>
                    <button
                        onClick={() => router.push(`/my-orders/${MOCK_ORDER.id}`)}
                        className="w-full py-3.5 rounded-xl border border-[#E8E6E0] text-[#5A5751] font-medium text-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
                    >
                        View Order Details
                    </button>
                </div>
            </div>

        </div>
    );
}
