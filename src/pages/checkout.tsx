import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, ShieldCheck, CreditCard, Wallet, Building2 } from 'lucide-react';

// --- Types (Mirrored from Shopping Bag) ---
interface BagItem {
    id: string;
    designName: string;
    designImage: string;
    serviceType: string;
    selections: {
        fabric: string;
        fabricId: string;
        color: string;
        colorId: string;
        colorHex: string;
        length: number;
    };
    designId: string;
    price: number;
    quantity: number;
}

// --- Payment Methods ---
const PAYMENT_METHODS = [
    {
        id: 'upi',
        title: 'UPI',
        subtitle: 'Google Pay, PhonePe, Paytm',
        icon: <Wallet size={20} />,
    },
    {
        id: 'card',
        title: 'Credit / Debit Card',
        subtitle: 'Visa, Mastercard, Rupay',
        icon: <CreditCard size={20} />,
    },
    {
        id: 'netbanking',
        title: 'Net Banking',
        subtitle: 'All Major Banks',
        icon: <Building2 size={20} />,
    }
];

export default function CheckoutPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [bagItems, setBagItems] = useState<BagItem[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        mobile: '',
        email: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('upi'); // Default Preselected
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load Data
    useEffect(() => {
        setMounted(true);
        const savedBag = localStorage.getItem('amma_bag');
        if (savedBag) {
            try {
                setBagItems(JSON.parse(savedBag));
            } catch (e) {
                console.error("Failed to parse bag items", e);
            }
        }

        // Simulating "Save address automatically if user is logged in"
        // In a real app, this would come from a user context or API
        const savedAddress = localStorage.getItem('amma_saved_address');
        if (savedAddress) {
            try {
                setFormData(JSON.parse(savedAddress));
            } catch (e) { }
        }
    }, []);

    // Derived Values
    const subtotal = bagItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = 0;
    const total = subtotal + delivery;

    // Validation
    const isAddressComplete =
        formData.fullName.length > 2 &&
        formData.mobile.length >= 10 &&
        formData.addressLine1.length > 5 &&
        formData.city.length > 2 &&
        formData.state.length > 2 &&
        formData.pincode.length >= 6;

    const canPlaceOrder = isAddressComplete && bagItems.length > 0;

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async () => {
        if (!canPlaceOrder || isSubmitting) return;

        setIsSubmitting(true);

        // Save address for future
        localStorage.setItem('amma_saved_address', JSON.stringify(formData));

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Clear Bag (Optional, depends on flow, usually clear after success)
        // localStorage.removeItem('amma_bag'); 
        // window.dispatchEvent(new Event('bagUpdated'));

        // Navigate to Success (Mock)
        // Navigate to Success
        router.push('/order-confirmation');
    };

    if (!mounted) return null;

    if (bagItems.length === 0) {
        // Redirect if empty
        if (typeof window !== 'undefined') router.replace('/shopping-bag');
        return null;
    }

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-32 pt-[64px] md:pt-[68px] lg:pt-[72px]">
            <Head>
                <title>Checkout | Amma Embroidery</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            </Head>

            {/* --- Local Header (Scrolls with page) --- */}
            <header className="w-full bg-[#F9F7F3] h-[80px] flex items-center px-4 pt-4">
                <h1 className="flex-1 text-center text-2xl font-serif text-[#1C1C1C]">
                    Checkout
                </h1>
            </header>

            <main className="max-w-md mx-auto px-4 py-6 space-y-8">

                {/* --- Section 1: Delivery Details --- */}
                <section>
                    <h2 className="font-serif text-xl text-[#1C1C1C] mb-6 flex items-center gap-2">
                        Delivery Details
                    </h2>
                    <div className="space-y-4">
                        <Input
                            label="Full Name"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="e.g. Ananya Rao"
                        />
                        <Input
                            label="Mobile Number"
                            name="mobile"
                            type="tel"
                            inputMode="numeric"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            placeholder="10-digit number"
                        />
                        <Input
                            label="Email (Optional)"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Updates on order status"
                        />

                        <div className="pt-2"></div>

                        <Input
                            label="Address Line 1"
                            name="addressLine1"
                            value={formData.addressLine1}
                            onChange={handleInputChange}
                            placeholder="Flat, House no., Building"
                        />
                        <Input
                            label="Address Line 2 (Optional)"
                            name="addressLine2"
                            value={formData.addressLine2}
                            onChange={handleInputChange}
                            placeholder="Area, Colony, Street"
                        />

                        <div className="flex gap-4">
                            <Input
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                containerClassName="flex-1"
                            />
                            <Input
                                label="Pincode"
                                name="pincode"
                                type="tel"
                                inputMode="numeric"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                containerClassName="w-32"
                            />
                        </div>
                        <Input
                            label="State"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                        />
                    </div>
                </section>

                {/* --- Section 2: Order Summary (Collapsible) --- */}
                <section className="bg-white rounded-xl border border-[#E8E6E0] overflow-hidden shadow-sm">
                    <button
                        onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                        className="w-full flex items-center justify-between p-5 bg-white active:bg-gray-50 transition-colors"
                    >
                        <div className="flex flex-col items-start text-left">
                            <span className="font-serif text-lg text-[#1C1C1C]">Order Summary</span>
                            <span className="text-xs text-[#777] mt-0.5">{bagItems.length} Items • ₹{total.toLocaleString()}</span>
                        </div>
                        <div className={`transition-transform duration-300 ${isSummaryExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown size={20} className="text-[#999]" />
                        </div>
                    </button>

                    <AnimatePresence>
                        {isSummaryExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                                <div className="px-5 pb-5 pt-0 border-t border-[#E8E6E0]">
                                    <div className="space-y-4 pt-4">
                                        {bagItems.map((item) => (
                                            <div key={item.id} className="flex gap-3 py-2 border-b border-dashed border-[#E8E6E0] last:border-0">
                                                <div className="w-14 h-16 bg-gray-100 rounded-md flex-shrink-0 relative overflow-hidden">
                                                    <div className={`absolute inset-0 ${item.designImage} opacity-30`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-serif text-sm text-[#1C1C1C] truncate pr-2">{item.designName}</h4>
                                                        <span className="text-sm font-medium text-[#1C1C1C]">₹{(item.price * item.quantity).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-[11px] text-[#777] uppercase tracking-wide mt-0.5">{item.serviceType}</p>
                                                    <p className="text-xs text-[#5A5751] mt-1">
                                                        {item.selections.fabric}, {item.selections.color}, {item.selections.length}m
                                                    </p>
                                                    {item.quantity > 1 && (
                                                        <p className="text-xs text-[#999] mt-0.5">Qty: {item.quantity}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-[#E8E6E0] space-y-2">
                                        <div className="flex justify-between text-sm text-[#5A5751]">
                                            <span>Subtotal</span>
                                            <span>₹{subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-[#5A5751]">
                                            <span>Delivery</span>
                                            <span className="text-green-600 font-medium">Free</span>
                                        </div>
                                        <div className="flex justify-between text-base font-medium text-[#1C1C1C] pt-2">
                                            <span>Total</span>
                                            <span>₹{total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* --- Section 3: Payment Method --- */}
                <section>
                    <h2 className="font-serif text-xl text-[#1C1C1C] mb-4">
                        Payment Method
                    </h2>
                    <div className="space-y-3">
                        {PAYMENT_METHODS.map((method) => {
                            const isSelected = paymentMethod === method.id;
                            return (
                                <div
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`
                                        relative rounded-xl p-4 border cursor-pointer transition-all duration-200
                                        ${isSelected
                                            ? 'bg-white border-[#C9A14A] ring-1 ring-[#C9A14A] shadow-md shadow-[#C9A14A]/5'
                                            : 'bg-white border-[#E8E6E0] hover:border-[#d4d1c9]'}
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                            w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                                            ${isSelected ? 'border-[#C9A14A] bg-[#C9A14A]' : 'border-[#999] bg-transparent'}
                                        `}>
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>

                                        <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center
                                            ${isSelected ? 'bg-[#C9A14A]/10 text-[#C9A14A]' : 'bg-gray-100 text-[#777]'}
                                        `}>
                                            {method.icon}
                                        </div>

                                        <div>
                                            <p className={`font-medium text-sm ${isSelected ? 'text-[#1C1C1C]' : 'text-[#5A5751]'}`}>
                                                {method.title}
                                            </p>
                                            <p className="text-xs text-[#999] mt-0.5">
                                                {method.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Trust Note */}
                    <div className="flex items-center justify-center gap-2 mt-6 opacity-60">
                        <ShieldCheck size={14} className="text-[#5A5751]" />
                        <span className="text-[11px] text-[#5A5751] uppercase tracking-wide">
                            Secure payments via trusted providers
                        </span>
                    </div>
                </section>

            </main>

            {/* --- Sticky Place Order Bar --- */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E6E0] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-md mx-auto flex flex-col gap-3">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-xs text-[#777] mb-1">Total Payable</span>
                        <span className="font-serif text-2xl text-[#1C1C1C]">
                            ₹{total.toLocaleString()}
                        </span>
                    </div>

                    <button
                        disabled={!canPlaceOrder || isSubmitting}
                        onClick={handlePlaceOrder}
                        className={`
                            w-full py-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200
                            ${(canPlaceOrder && !isSubmitting)
                                ? 'bg-[#C9A14A] text-white shadow-lg shadow-[#C9A14A]/30 active:scale-[0.98]'
                                : 'bg-[#E8E6E0] text-[#999] cursor-not-allowed'}
                        `}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                                Processing...
                            </span>
                        ) : (
                            <span>Place Order</span>
                        )}
                    </button>

                    {!canPlaceOrder && (
                        <p className="text-[10px] text-center text-red-400 font-medium">
                            Please complete delivery details
                        </p>
                    )}
                </div>
            </div>

        </div>
    );
}

// --- Reusable Input Component ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    containerClassName?: string;
}

function Input({ label, containerClassName, className, ...props }: InputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value && String(props.value).length > 0;

    return (
        <div className={`relative ${containerClassName}`}>
            {/* Animated Label */}
            <label
                className={`
                    absolute left-4 px-1 transition-all duration-200 pointer-events-none z-10
                    ${(isFocused || hasValue)
                        ? '-top-2 text-[10px] bg-white text-[#C9A14A] font-medium'
                        : 'top-3.5 text-sm text-[#999]'}
                `}
            >
                {label}
            </label>

            <input
                {...props}
                onFocus={(e) => {
                    setIsFocused(true);
                    props.onFocus?.(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    props.onBlur?.(e);
                }}
                className={`
                    w-full bg-white border rounded-xl px-4 py-3.5 text-[#1C1C1C] outline-none transition-all
                    ${(isFocused || hasValue) ? 'border-[#C9A14A] ring-1 ring-[#C9A14A]/10' : 'border-[#E8E6E0]'}
                    placeholder:text-transparent
                    ${className}
                `}
                placeholder={label}
            />

            {/* Helper Validation Styles */}
            <AnimatePresence>
                {hasValue && !isFocused && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute right-3 top-3.5 text-[#C9A14A]"
                    >
                        <Check size={18} strokeWidth={2.5} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
