import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, Edit2, Trash2, Check, ArrowLeft, Loader2, Home, Briefcase } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// --- Types ---
interface Address {
    id: string;
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    address_type: 'pickup' | 'delivery' | 'both';
    landmark?: string;
    preferred_time?: string;
    is_default: boolean;
}

// --- Validation Helpers ---
const validatePhone = (phone: string) => /^\d{10}$/.test(phone);
const validatePincode = (pincode: string) => /^\d{6}$/.test(pincode);

export default function SavedAddresses() {
    const router = useRouter();
    const { isAuthenticated, protectAction } = useAuth();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        address_type: 'delivery',
        landmark: '',
        preferred_time: '',
        is_default: false
    });

    const resetForm = () => {
        setFormData({
            full_name: '',
            phone: '',
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            pincode: '',
            address_type: 'delivery',
            landmark: '',
            preferred_time: '',
            is_default: false
        });
        setEditingAddress(null);
        setIsFormOpen(false);
    };

    // --- Fetch Addresses ---
    const fetchAddresses = async () => {
        if (!isAuthenticated) return;
        try {
            const { supabase } = await import('../lib/supabaseClient');
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', user.id)
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAddresses(data || []);
        } catch (err) {
            console.error("Error fetching addresses", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchAddresses();
        } else if (!loading) { // If finished initial load check and still not auth
            // redirect handled by protectAction usually or just show empty/login prompt
            setLoading(false);
        }
    }, [isAuthenticated]);


    // --- Handlers ---

    const handleEdit = (addr: Address) => {
        setEditingAddress(addr);
        setFormData({
            ...addr,
            address_line2: addr.address_line2 || '',
            landmark: addr.landmark || '',
            preferred_time: addr.preferred_time || '',
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this address?")) return;

        try {
            const { supabase } = await import('../lib/supabaseClient');
            const { error } = await supabase.from('addresses').delete().eq('id', id);
            if (error) throw error;
            setAddresses(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete address.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!validatePhone(formData.phone)) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }
        if (!validatePincode(formData.pincode)) {
            alert("Please enter a valid 6-digit pincode.");
            return;
        }

        setSubmitting(true);
        protectAction(async () => {
            try {
                const { supabase } = await import('../lib/supabaseClient');
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("No user");

                // If setting as default, unset others first (handled by DB trigger usually, but manual here for safety)
                if (formData.is_default) {
                    await supabase
                        .from('addresses')
                        .update({ is_default: false })
                        .eq('user_id', user.id);
                }

                const payload = {
                    ...formData,
                    user_id: user.id,
                    address_type: formData.address_type // Ensure type matches constraint
                };

                let error;
                if (editingAddress) {
                    const { error: updateError } = await supabase
                        .from('addresses')
                        .update(payload)
                        .eq('id', editingAddress.id);
                    error = updateError;
                } else {
                    const { error: insertError } = await supabase
                        .from('addresses')
                        .insert(payload);
                    error = insertError;
                }

                if (error) throw error;

                await fetchAddresses();
                resetForm();

            } catch (err: any) {
                console.error("Save failed", err);
                alert(err.message || "Failed to save address.");
            } finally {
                setSubmitting(false);
            }
        });
    };

    if (loading) return null;

    return (
        <>
            <Head>
                <title>Saved Addresses | Amma Embroidery</title>
            </Head>

            <div className="min-h-screen bg-[#F9F7F3] pt-[84px] pb-24 px-4 lg:px-8 font-sans">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="font-serif text-3xl text-[#1C1C1C] mb-1">My Addresses</h1>
                            <p className="text-[#555555] text-sm">Manage your pickup and delivery locations.</p>
                        </div>
                        <button
                            onClick={() => { resetForm(); setIsFormOpen(true); }}
                            className="bg-[#C9A14A] text-white p-3 rounded-full hover:bg-[#B08D40] shadow-lg transition-transform active:scale-95"
                        >
                            <Plus size={24} />
                        </button>
                    </div>

                    {/* Address List */}
                    <div className="space-y-4">
                        {addresses.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 bg-[#F9F7F3] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="text-[#C9A14A]" size={24} />
                                </div>
                                <h3 className="text-[#1C1C1C] font-serif text-lg mb-2">No addresses saved</h3>
                                <p className="text-[#999] text-sm max-w-xs mx-auto">Add a new address for faster checkout.</p>
                            </div>
                        ) : (
                            addresses.map((addr) => (
                                <div key={addr.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative group">
                                    {/* Default Badge */}
                                    {addr.is_default && (
                                        <span className="absolute top-5 right-5 bg-[#F9F7F3] text-[#C9A14A] text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                                            Default
                                        </span>
                                    )}

                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="mt-1">
                                            {addr.address_type === 'pickup' ? <Briefcase size={18} className="text-[#555]" /> : <Home size={18} className="text-[#555]" />}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-[#1C1C1C] text-sm flex items-center gap-2">
                                                {addr.full_name}
                                                <span className="text-[#999] font-normal text-xs border border-gray-200 px-1 rounded uppercase">{addr.address_type}</span>
                                            </h4>
                                            <p className="text-[#555] text-sm">{addr.phone}</p>
                                        </div>
                                    </div>

                                    <div className="pl-8 mb-4">
                                        <p className="text-[#555] text-sm leading-relaxed">
                                            {addr.address_line1}, {addr.address_line2 && `${addr.address_line2}, `}
                                            {addr.city}, {addr.state} - {addr.pincode}
                                        </p>
                                        {addr.landmark && <p className="text-[#999] text-xs mt-1">Landmark: {addr.landmark}</p>}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-4 pl-8 border-t border-gray-50 pt-3">
                                        <button
                                            onClick={() => handleEdit(addr)}
                                            className="text-xs uppercase font-medium text-[#C9A14A] hover:text-[#B08D40] flex items-center gap-1"
                                        >
                                            <Edit2 size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(addr.id)}
                                            className="text-xs uppercase font-medium text-red-400 hover:text-red-500 flex items-center gap-1"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal (Full Screen on Mobile) */}
            <AnimatePresence>
                {isFormOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
                        onClick={resetForm}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white w-full h-[90vh] sm:h-auto sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <h2 className="font-serif text-xl text-[#1C1C1C]">
                                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                                </h2>
                                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-full">
                                    <ArrowLeft size={20} className="sm:hidden" /> {/* Close/Back icon */}
                                    <span className="hidden sm:block text-2xl leading-none">&times;</span>
                                </button>
                            </div>

                            {/* Form Content */}
                            <div className="p-6 overflow-y-auto flex-1">
                                <form id="address-form" onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Full Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.full_name}
                                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                                className="w-full text-sm p-3 bg-[#F9F7F3] rounded-lg border-none focus:ring-1 focus:ring-[#C9A14A]"
                                                placeholder="e.g. John Doe"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Phone Number</label>
                                            <input
                                                required
                                                type="tel"
                                                maxLength={10}
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                                className="w-full text-sm p-3 bg-[#F9F7F3] rounded-lg border-none focus:ring-1 focus:ring-[#C9A14A]"
                                                placeholder="10-digit mobile number"
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Address Line 1</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.address_line1}
                                                onChange={e => setFormData({ ...formData, address_line1: e.target.value })}
                                                className="w-full text-sm p-3 bg-[#F9F7F3] rounded-lg border-none focus:ring-1 focus:ring-[#C9A14A]"
                                                placeholder="House No., Building, Street"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Address Line 2 (Optional)</label>
                                            <input
                                                type="text"
                                                value={formData.address_line2}
                                                onChange={e => setFormData({ ...formData, address_line2: e.target.value })}
                                                className="w-full text-sm p-3 bg-[#F9F7F3] rounded-lg border-none focus:ring-1 focus:ring-[#C9A14A]"
                                                placeholder="Area, Colony, Sector"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">City</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.city}
                                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full text-sm p-3 bg-[#F9F7F3] rounded-lg border-none focus:ring-1 focus:ring-[#C9A14A]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">State</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.state}
                                                onChange={e => setFormData({ ...formData, state: e.target.value })}
                                                className="w-full text-sm p-3 bg-[#F9F7F3] rounded-lg border-none focus:ring-1 focus:ring-[#C9A14A]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Pincode</label>
                                            <input
                                                required
                                                type="text"
                                                maxLength={6}
                                                value={formData.pincode}
                                                onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                                                className="w-full text-sm p-3 bg-[#F9F7F3] rounded-lg border-none focus:ring-1 focus:ring-[#C9A14A]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Type</label>
                                            <select
                                                value={formData.address_type}
                                                onChange={e => setFormData({ ...formData, address_type: e.target.value as any })}
                                                className="w-full text-sm p-3 bg-[#F9F7F3] rounded-lg border-none focus:ring-1 focus:ring-[#C9A14A]"
                                            >
                                                <option value="delivery">Delivery</option>
                                                <option value="pickup">Pickup</option>
                                                <option value="both">Both</option>
                                            </select>
                                        </div>

                                        <div className="col-span-2">
                                            <label className="flex items-center gap-3 p-3 bg-[#F9F7F3] rounded-lg cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_default}
                                                    onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
                                                    className="accent-[#C9A14A] w-5 h-5"
                                                />
                                                <span className="text-sm font-medium text-[#1C1C1C]">Use as default address</span>
                                            </label>
                                        </div>

                                    </div>
                                </form>
                            </div>

                            {/* Footer CTA */}
                            <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0 z-10">
                                <button
                                    form="address-form"
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-[#C9A14A] text-white py-3.5 rounded-lg flex items-center justify-center gap-2 font-medium tracking-wide shadow-lg disabled:opacity-70"
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                                    {editingAddress ? 'Update Address' : 'Save Address'}
                                </button>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
