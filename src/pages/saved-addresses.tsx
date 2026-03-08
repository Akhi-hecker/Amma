import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, Edit2, Trash2, Check, ArrowLeft, Loader2, Home, Briefcase } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, writeBatch } from 'firebase/firestore';

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
    const { isAuthenticated, protectAction, user } = useAuth();

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
        if (!isAuthenticated || !user) return;
        try {
            const addressesRef = collection(db, 'users', user.id, 'addresses');
            // Basic query, sort in memory for simplicity or add index later
            const snapshot = await getDocs(addressesRef);

            const fetchedAddresses: Address[] = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                fetchedAddresses.push({
                    id: doc.id,
                    ...data
                } as Address);
            });

            // Sort: default first, then created_at desc (if we had created_at), or just by name/id
            fetchedAddresses.sort((a, b) => {
                if (a.is_default === b.is_default) return 0;
                return a.is_default ? -1 : 1;
            });

            setAddresses(fetchedAddresses);
        } catch (err) {
            console.error("Error fetching addresses", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchAddresses();
        } else if (!loading) {
            setLoading(false);
        }
    }, [isAuthenticated, user]);


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
        if (!user) return;

        try {
            await deleteDoc(doc(db, 'users', user.id, 'addresses', id));
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
                if (!user) throw new Error("No user");

                const addressesRef = collection(db, 'users', user.id, 'addresses');

                // If setting as default, unset others first
                if (formData.is_default) {
                    const batch = writeBatch(db);
                    const snapshot = await getDocs(addressesRef);
                    snapshot.forEach((docSnap) => {
                        if (docSnap.data().is_default && docSnap.id !== editingAddress?.id) {
                            batch.update(docSnap.ref, { is_default: false });
                        }
                    });
                    await batch.commit();
                }

                const payload = {
                    ...formData,
                    address_type: formData.address_type,
                    updated_at: new Date().toISOString()
                };

                if (editingAddress) {
                    await updateDoc(doc(db, 'users', user.id, 'addresses', editingAddress.id), payload);
                } else {
                    await addDoc(addressesRef, {
                        ...payload,
                        created_at: new Date().toISOString()
                    });
                }

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
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h1 className="font-serif text-4xl font-light text-[#1C1C1C] mb-2 tracking-wide">My Addresses</h1>
                            <p className="text-[#999] text-[10px] uppercase tracking-[0.2em] font-medium">Manage your locations</p>
                        </div>
                        <button
                            onClick={() => { resetForm(); setIsFormOpen(true); }}
                            className="bg-[#1C1C1C] text-white p-4 rounded-none hover:bg-black transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] flex items-center justify-center group"
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" strokeWidth={1.5} />
                        </button>
                    </div>

                    {/* Address List */}
                    <div className="space-y-4">
                        {addresses.length === 0 ? (
                            <div className="text-center py-20 bg-transparent border border-[#E8E6E0] rounded-none">
                                <div className="w-16 h-16 bg-transparent border border-[#E8E6E0] rounded-none flex items-center justify-center mx-auto mb-6">
                                    <MapPin className="text-[#1C1C1C] opacity-40" strokeWidth={1.5} size={20} />
                                </div>
                                <h3 className="font-serif text-2xl font-light text-[#1C1C1C] mb-3 tracking-wide">No addresses saved</h3>
                                <p className="text-[#999] text-[10px] uppercase tracking-[0.2em] font-medium max-w-xs mx-auto leading-relaxed">Add a new address for faster checkout.</p>
                            </div>
                        ) : (
                            addresses.map((addr) => (
                                <div key={addr.id} className="bg-white p-6 rounded-none shadow-none border border-[#E8E6E0] relative group hover:border-[#CCCCCC] transition-colors">
                                    {/* Default Badge */}
                                    {addr.is_default && (
                                        <span className="absolute top-6 right-6 bg-[#F9F7F3] text-[#1C1C1C] text-[9px] uppercase tracking-[0.2em] font-medium px-3 py-1.5 rounded-none border border-[#E8E6E0]">
                                            Default
                                        </span>
                                    )}

                                    <div className="flex items-start gap-4 mb-4 mt-1">
                                        <div className="mt-1">
                                            {addr.address_type === 'pickup' ? <Briefcase size={18} strokeWidth={1.5} className="text-[#1C1C1C]/60" /> : <Home size={18} strokeWidth={1.5} className="text-[#1C1C1C]/60" />}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-[#1C1C1C] text-sm flex items-center gap-3 tracking-wide">
                                                {addr.full_name}
                                                <span className="text-[#999] font-medium text-[9px] border border-[#E8E6E0] px-2 py-0.5 tracking-[0.1em] rounded-none uppercase">{addr.address_type}</span>
                                            </h4>
                                            <p className="text-[#999] text-[10px] uppercase tracking-[0.1em] font-medium mt-1">{addr.phone}</p>
                                        </div>
                                    </div>

                                    <div className="pl-8 mb-6 ml-0.5">
                                        <p className="text-[#555] text-sm leading-relaxed font-light">
                                            {addr.address_line1}, {addr.address_line2 && `${addr.address_line2}, `}
                                            {addr.city}, {addr.state} - <span className="font-medium">{addr.pincode}</span>
                                        </p>
                                        {addr.landmark && <p className="text-[#999] text-[10px] uppercase tracking-widest mt-2 border-l border-[#E8E6E0] pl-3 py-1">Landmark: {addr.landmark}</p>}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-6 pl-8 border-t border-[#E8E6E0] pt-4 ml-0.5">
                                        <button
                                            onClick={() => handleEdit(addr)}
                                            className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#999] hover:text-[#1C1C1C] transition-colors flex items-center gap-2"
                                        >
                                            <Edit2 size={12} strokeWidth={1.5} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(addr.id)}
                                            className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#999] hover:text-red-500 transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 size={12} strokeWidth={1.5} /> Delete
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
                            className="bg-white w-full h-[90vh] sm:h-auto sm:max-w-lg rounded-none shadow-2xl border border-[#1C1C1C]/10 overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-[#E8E6E0] flex items-center justify-between bg-white sticky top-0 z-10">
                                <h2 className="font-serif text-2xl font-light text-[#1C1C1C] tracking-wide">
                                    {editingAddress ? 'Edit Address' : 'Add Address'}
                                </h2>
                                <button onClick={resetForm} className="p-2 text-[#999] hover:text-[#1C1C1C] transition-colors">
                                    <span className="text-2xl leading-none font-light">&times;</span>
                                </button>
                            </div>

                            {/* Form Content */}
                            <div className="p-8 overflow-y-auto flex-1">
                                <form id="address-form" onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="col-span-2">
                                            <label className="block text-[9px] font-medium uppercase tracking-[0.2em] text-[#999] mb-1 pl-1">Full Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.full_name}
                                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                                className="w-full text-sm py-4 bg-transparent border-b border-[#E8E6E0] rounded-none focus:border-[#1C1C1C] outline-none transition-colors placeholder-[#CCC]"
                                                placeholder="e.g. John Doe"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[9px] font-medium uppercase tracking-[0.2em] text-[#999] mb-1 pl-1">Phone Number</label>
                                            <input
                                                required
                                                type="tel"
                                                maxLength={10}
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                                className="w-full text-sm py-4 bg-transparent border-b border-[#E8E6E0] rounded-none focus:border-[#1C1C1C] outline-none transition-colors placeholder-[#CCC]"
                                                placeholder="10-digit mobile number"
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-[9px] font-medium uppercase tracking-[0.2em] text-[#999] mb-1 pl-1">Address Line 1</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.address_line1}
                                                onChange={e => setFormData({ ...formData, address_line1: e.target.value })}
                                                className="w-full text-sm py-4 bg-transparent border-b border-[#E8E6E0] rounded-none focus:border-[#1C1C1C] outline-none transition-colors placeholder-[#CCC]"
                                                placeholder="House No., Building, Street"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[9px] font-medium uppercase tracking-[0.2em] text-[#999] mb-1 pl-1">Address Line 2 (Optional)</label>
                                            <input
                                                type="text"
                                                value={formData.address_line2}
                                                onChange={e => setFormData({ ...formData, address_line2: e.target.value })}
                                                className="w-full text-sm py-4 bg-transparent border-b border-[#E8E6E0] rounded-none focus:border-[#1C1C1C] outline-none transition-colors placeholder-[#CCC]"
                                                placeholder="Area, Colony, Sector"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[9px] font-medium uppercase tracking-[0.2em] text-[#999] mb-1 pl-1">City</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.city}
                                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full text-sm py-4 bg-transparent border-b border-[#E8E6E0] rounded-none focus:border-[#1C1C1C] outline-none transition-colors placeholder-[#CCC]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-medium uppercase tracking-[0.2em] text-[#999] mb-1 pl-1">State</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.state}
                                                onChange={e => setFormData({ ...formData, state: e.target.value })}
                                                className="w-full text-sm py-4 bg-transparent border-b border-[#E8E6E0] rounded-none focus:border-[#1C1C1C] outline-none transition-colors placeholder-[#CCC]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[9px] font-medium uppercase tracking-[0.2em] text-[#999] mb-1 pl-1">Pincode</label>
                                            <input
                                                required
                                                type="text"
                                                maxLength={6}
                                                value={formData.pincode}
                                                onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                                                className="w-full text-sm py-4 bg-transparent border-b border-[#E8E6E0] rounded-none focus:border-[#1C1C1C] outline-none transition-colors placeholder-[#CCC]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-medium uppercase tracking-[0.2em] text-[#999] mb-1 pl-1">Type</label>
                                            <select
                                                value={formData.address_type}
                                                onChange={e => setFormData({ ...formData, address_type: e.target.value as any })}
                                                className="w-full text-sm py-4 bg-transparent border-b border-[#E8E6E0] rounded-none focus:border-[#1C1C1C] outline-none transition-colors placeholder-[#CCC]"
                                            >
                                                <option value="delivery">Delivery</option>
                                                <option value="pickup">Pickup</option>
                                                <option value="both">Both</option>
                                            </select>
                                        </div>

                                        <div className="col-span-2 mt-4">
                                            <label className="flex items-center gap-4 py-4 px-2 hover:bg-[#F9F7F3] transition-colors rounded-none cursor-pointer border border-transparent">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.is_default}
                                                        onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
                                                        className="appearance-none w-5 h-5 border border-[#1C1C1C]/30 rounded-none checked:bg-[#1C1C1C] checked:border-[#1C1C1C] focus:outline-none transition-colors peer"
                                                    />
                                                    <Check size={14} strokeWidth={2.5} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                                                </div>
                                                <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#1C1C1C]">Use as default address</span>
                                            </label>
                                        </div>

                                    </div>
                                </form>
                            </div>

                            {/* Footer CTA */}
                            <div className="p-6 border-t border-[#E8E6E0] bg-white sticky bottom-0 z-10">
                                <button
                                    form="address-form"
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-[#1C1C1C] text-white py-4 rounded-none text-[11px] tracking-[0.2em] uppercase font-medium shadow-none hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] hover:bg-black transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:shadow-none"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} strokeWidth={1.5} />}
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
