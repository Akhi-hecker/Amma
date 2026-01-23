import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Check, Package, MapPin, Plus, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Design } from '@/data/designs';
import { useAuth } from '@/context/AuthContext';

interface Address {
    id: string;
    full_name: string;
    address_line1: string;
    city: string;
    pincode: string;
    address_type: string;
    phone: string;
}

export default function SendYourFabricPage() {
    const router = useRouter();
    const { designId } = router.query;
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
    const [loadingDesign, setLoadingDesign] = useState(true);

    // Data State
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        fabric_type: '',
        color: '',
        length: '',
        notes: ''
    });

    // Modal State
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [newAddress, setNewAddress] = useState({
        full_name: '',
        phone: '',
        address_line1: '',
        city: '',
        pincode: '',
        state: 'State', // Default or logic
        address_type: 'pickup'
    });
    const [isAddingAddress, setIsAddingAddress] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Auth Protection
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            // Optional: Redirect to login or show auth prompt
            router.push(`/login?redirectTo=/send-your-fabric?designId=${designId}`);
        }
    }, [authLoading, isAuthenticated, router, designId]);

    // Fetch Design and Addresses
    useEffect(() => {
        if (!router.isReady || !designId) return;

        async function initData() {
            setLoadingDesign(true);
            try {
                // 1. Fetch Design
                const { data: designData } = await supabase
                    .from('designs')
                    .select('*')
                    .eq('id', designId)
                    .single();

                if (designData) {
                    let imageColor = 'bg-gray-50';
                    switch (designData.category) {
                        case 'Floral': imageColor = 'bg-rose-100'; break;
                        case 'Traditional': imageColor = 'bg-amber-100'; break;
                        case 'Modern': imageColor = 'bg-slate-100'; break;
                        default: imageColor = 'bg-gray-50';
                    }
                    setSelectedDesign({
                        id: designData.id,
                        name: designData.title,
                        category: designData.category,
                        image: imageColor,
                        descriptor: designData.short_description,
                        base_price: designData.base_price,
                        fabric_suitability: designData.fabric_suitability
                    } as any);
                }

                // 2. Fetch Addresses (if authenticated)
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                if (currentUser) {
                    const { data: addrData } = await supabase
                        .from('addresses')
                        .select('*')
                        .eq('user_id', currentUser.id)
                        .in('address_type', ['pickup', 'both'])
                        .order('created_at', { ascending: false });

                    if (addrData) {
                        setAddresses(addrData);
                        if (addrData.length > 0) setSelectedAddressId(addrData[0].id);
                    }
                }

            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoadingDesign(false);
            }
        }

        initData();
    }, [router.isReady, designId]);

    const handleFabricChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAddress = async () => {
        setIsAddingAddress(true);
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from('addresses')
                .insert({
                    user_id: currentUser.id,
                    ...newAddress,
                    address_line2: '',
                    state: 'India', // Hardcoded for MVP or add field
                    is_default: false
                })
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setAddresses([data, ...addresses]);
                setSelectedAddressId(data.id);
                setShowAddressModal(false);
                // Reset form
                setNewAddress({
                    full_name: '',
                    phone: '',
                    address_line1: '',
                    city: '',
                    pincode: '',
                    state: 'India',
                    address_type: 'pickup'
                });
            }
        } catch (err) {
            console.error("Error adding address:", err);
            alert("Failed to save address.");
        } finally {
            setIsAddingAddress(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedAddressId || !formData.fabric_type) return;
        setIsSubmitting(true);

        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) throw new Error("Not authenticated");

            // 1. Check for existing draft
            const { data: existingDrafts } = await supabase
                .from('order_drafts')
                .select('id')
                .eq('user_id', currentUser.id)
                .eq('service_type', 'send_your_fabric')
                .eq('status', 'draft');

            const pickupAddress = addresses.find(a => a.id === selectedAddressId);

            const draftPayload = {
                user_id: currentUser.id,
                service_type: 'send_your_fabric',
                design_id: designId,
                pickup_address_id: selectedAddressId,
                fabric_details: {
                    fabric_type: formData.fabric_type,
                    color: formData.color,
                    length: formData.length,
                    notes: formData.notes
                },
                estimated_price: selectedDesign?.base_price || 0,
                quantity: 1,
                status: 'draft',
                updated_at: new Date().toISOString()
            };

            if (existingDrafts && existingDrafts.length > 0) {
                // Update
                const { error } = await supabase
                    .from('order_drafts')
                    .update(draftPayload)
                    .eq('id', existingDrafts[0].id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from('order_drafts')
                    .insert(draftPayload);
                if (error) throw error;
            }

            setIsSubmitted(true);

        } catch (err) {
            console.error("Submission error:", err);
            alert("Failed to submit request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    const isFormValid = formData.fabric_type && selectedAddressId;

    if (!mounted) return null;
    if (authLoading || loadingDesign) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9F7F3]">
            <Loader2 className="animate-spin text-[#C9A14A]" size={32} />
        </div>
    );

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] flex flex-col items-center justify-center p-6 text-center">
                <Head><title>Request Received | Amma Embroidery</title></Head>
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 shadow-card max-w-sm w-full">
                    <div className="w-16 h-16 bg-[#C9A14A]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#C9A14A]">
                        <Check size={32} />
                    </div>
                    <h1 className="font-serif text-2xl mb-3 text-[#1C1C1C]">Pickup Requested</h1>
                    <p className="text-[#555] text-sm leading-relaxed mb-8">
                        We have received your pickup request. Our team will contact you shortly to coordinate.
                    </p>
                    <div className="space-y-3">
                        <button onClick={() => router.push('/designs')} className="w-full py-3 rounded-lg bg-[#C9A14A] text-white font-medium text-sm hover:bg-[#B89240] transition-colors">Continue Browsing</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-32 pt-[64px] md:pt-[68px] lg:pt-[72px]">
            <Head><title>Send Your Fabric | Amma Embroidery</title></Head>

            <div className="max-w-md mx-auto px-4 space-y-8 pt-2">
                <div className="text-center mb-4">
                    <h1 className="font-serif text-3xl text-[#1C1C1C] mb-2">Send Your Fabric</h1>
                    <p className="font-sans text-[#555555] text-sm">Expert embroidery on your own material.</p>
                </div>

                {/* Design Summary */}
                {selectedDesign && (
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-[#E8E6E0] flex items-center gap-4">
                        <div className={`w-12 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative`}>
                            <div className={`absolute inset-0 ${selectedDesign.image} opacity-80`} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-[#999] font-medium mb-0.5">Selected Design</p>
                            <h3 className="font-serif text-base text-[#1C1C1C]">{selectedDesign.name}</h3>
                        </div>
                    </div>
                )}

                {/* Section 1: Fabric Details */}
                <section>
                    <h2 className="font-serif text-lg mb-4 text-[#1C1C1C]">Fabric Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-[#777] mb-1.5 uppercase tracking-wide">Fabric Type</label>
                            <input type="text" name="fabric_type" placeholder="e.g. Cotton, Silk" value={formData.fabric_type} onChange={handleFabricChange} className="w-full p-3 rounded-lg border border-[#E8E6E0] bg-white text-sm outline-none focus:border-[#C9A14A]" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-[#777] mb-1.5 uppercase tracking-wide">Color</label>
                                <input type="text" name="color" placeholder="e.g. Red" value={formData.color} onChange={handleFabricChange} className="w-full p-3 rounded-lg border border-[#E8E6E0] bg-white text-sm outline-none focus:border-[#C9A14A]" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[#777] mb-1.5 uppercase tracking-wide">Approx Length</label>
                                <input type="text" name="length" placeholder="e.g. 2.5m" value={formData.length} onChange={handleFabricChange} className="w-full p-3 rounded-lg border border-[#E8E6E0] bg-white text-sm outline-none focus:border-[#C9A14A]" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#777] mb-1.5 uppercase tracking-wide">Notes</label>
                            <textarea name="notes" rows={2} placeholder="Any specific instructions..." value={formData.notes} onChange={handleFabricChange} className="w-full p-3 rounded-lg border border-[#E8E6E0] bg-white text-sm outline-none focus:border-[#C9A14A] resize-none" />
                        </div>
                    </div>
                </section>

                {/* Section 2: Pickup Address */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-serif text-lg text-[#1C1C1C]">Pickup Location</h2>
                        {selectedAddress && (
                            <button onClick={() => setShowAddressModal(true)} className="text-[#C9A14A] text-xs font-medium uppercase">Change</button>
                        )}
                    </div>

                    {selectedAddress ? (
                        <div className="bg-white rounded-xl p-4 border border-[#E8E6E0] flex items-start gap-3">
                            <MapPin className="text-[#555] mt-0.5" size={18} />
                            <div>
                                <p className="text-sm font-medium text-[#1C1C1C]">{selectedAddress.full_name}</p>
                                <p className="text-xs text-[#555] leading-relaxed mt-1">
                                    {selectedAddress.address_line1}, {selectedAddress.city} - {selectedAddress.pincode}
                                </p>
                                <span className="text-[10px] bg-[#F9F7F3] px-2 py-0.5 rounded text-[#777] uppercase mt-2 inline-block">
                                    {selectedAddress.address_type}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div onClick={() => setShowAddressModal(true)} className="bg-white border-2 border-dashed border-[#E8E6E0] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#C9A14A] transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-[#F9F7F3] flex items-center justify-center text-[#999] group-hover:text-[#C9A14A] group-hover:bg-[#FFFBF2] mb-2 transition-colors">
                                <Plus size={20} />
                            </div>
                            <p className="text-sm font-medium text-[#555]">Add Pickup Address</p>
                        </div>
                    )}
                </section>
            </div>

            {/* Sticky CTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E6E0] p-4 pb-8 safe-area-pb shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={handleSubmit}
                        disabled={!isFormValid || isSubmitting}
                        className={`w-full py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300
                            ${!isFormValid
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-[#C9A14A] text-white shadow-lg hover:bg-[#B89240] active:scale-[0.98]'
                            }
                        `}
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                <span>Request Fabric Pickup</span>
                                <Truck size={18} />
                            </>
                        )}
                    </button>
                    <p className="text-[10px] text-center text-[#999] mt-3">
                        Pickup fees calculated at next step based on location.
                    </p>
                </div>
            </div>

            {/* Address Modal */}
            <AnimatePresence>
                {showAddressModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center pt-10"
                        onClick={() => setShowAddressModal(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white w-full max-h-[90vh] sm:max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <h3 className="font-serif text-lg">Select Pickup Address</h3>
                                <button onClick={() => setShowAddressModal(false)} className="text-2xl leading-none">&times;</button>
                            </div>

                            <div className="p-4 overflow-y-auto flex-1 space-y-6">
                                {/* List Existing */}
                                {addresses.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-[#999] uppercase tracking-wide">Saved Addresses</p>
                                        {addresses.map(addr => (
                                            <div
                                                key={addr.id}
                                                onClick={() => { setSelectedAddressId(addr.id); setShowAddressModal(false); }}
                                                className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 ${selectedAddressId === addr.id ? 'border-[#C9A14A] bg-[#FFFBF2]' : 'border-gray-200'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0 ${selectedAddressId === addr.id ? 'border-[#C9A14A]' : 'border-gray-300'}`}>
                                                    {selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-[#C9A14A]" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-[#1C1C1C]">{addr.full_name}</p>
                                                    <p className="text-xs text-[#555] mt-0.5">{addr.address_line1}, {addr.city}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add New Form */}
                                <div>
                                    <p className="text-xs font-bold text-[#999] uppercase tracking-wide mb-3">Add New Address</p>
                                    <div className="space-y-3">
                                        <input name="full_name" placeholder="Contact Name" value={newAddress.full_name} onChange={handleNewAddressChange} className="w-full p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#C9A14A]" />
                                        <input name="phone" placeholder="Phone Number" value={newAddress.phone} onChange={handleNewAddressChange} className="w-full p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#C9A14A]" />
                                        <input name="address_line1" placeholder="Address (House No, Street)" value={newAddress.address_line1} onChange={handleNewAddressChange} className="w-full p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#C9A14A]" />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input name="city" placeholder="City" value={newAddress.city} onChange={handleNewAddressChange} className="w-full p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#C9A14A]" />
                                            <input name="pincode" placeholder="Pincode" value={newAddress.pincode} onChange={handleNewAddressChange} className="w-full p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#C9A14A]" />
                                        </div>
                                        <button
                                            onClick={handleSaveAddress}
                                            disabled={!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || isAddingAddress}
                                            className="w-full py-3 rounded-lg bg-[#1C1C1C] text-white font-medium text-sm disabled:opacity-50"
                                        >
                                            {isAddingAddress ? 'Saving...' : 'Save & Select Address'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
