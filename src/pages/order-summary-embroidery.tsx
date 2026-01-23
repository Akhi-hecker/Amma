import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Loader2, MapPin, ChevronRight, Plus, Check } from 'lucide-react';
import { Design } from '@/data/designs';
import { supabase } from '@/lib/supabaseClient';

const STITCHING_BASE_COST = 1500; // Flat stitching fee logic

const GARMENT_BASE_PRICES: Record<string, number> = {
    blouse: 800,
    dress: 1500,
    saree: 500,
    kurta: 1000,
    lehenga: 2500,
    other: 1000
};

const EST_CONSUMPTION: Record<string, number> = {
    blouse: 1,
    dress: 3,
    saree: 5.5,
    kurta: 2.5,
    lehenga: 4,
    other: 2
};

interface Address {
    id: string;
    full_name: string;
    address_line1: string;
    city: string;
    pincode: string;
    address_type: string;
    is_default: boolean;
}

export default function OrderSummaryEmbroideryPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
    const [fabrics, setFabrics] = useState<any[]>([]);
    const [colors, setColors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Address State
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showAddressModal, setShowAddressModal] = useState(false);

    // Use Auth
    const [user, setUser] = useState<any>(null); // Simplified user check
    useEffect(() => {
        // We need real auth user for addresses
        const checkAuth = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            setUser(authUser);

            // Fallback for visual username if needed, but for DB address fetch we need real auth
            const stored = localStorage.getItem('amma_user');
            if (!authUser && stored) setUser(JSON.parse(stored));
        };
        checkAuth();
    }, []);

    // Get Query Params
    const { designId, fabricId, colorId, length, garment, sizeType, sizeValue } = router.query;

    // Derived Logic
    const isStitching = !!garment;

    // Data Objects
    const selectedFabric = fabrics.find(f => f.id === fabricId);
    const selectedColor = colors.find(c => c.id === colorId);

    // Params Parsing
    const selectedLength = length ? parseFloat(length as string) : 0;
    const garmentKey = (garment as string) || '';
    const garmentName = garmentKey.charAt(0).toUpperCase() + garmentKey.slice(1);

    // Size Display Logic
    let sizeDisplay = 'Not Selected';
    let sizeDetails = null;
    if (sizeType === 'standard') {
        sizeDisplay = `Size ${sizeValue}`;
    } else if (sizeType === 'custom' && typeof sizeValue === 'string') {
        try {
            const measurements = JSON.parse(sizeValue);
            sizeDisplay = 'Custom Measurements';
            sizeDetails = measurements;
        } catch (e) {
            sizeDisplay = 'Custom (Error)';
        }
    }

    // Price Calculation
    const consumption = isStitching ? (EST_CONSUMPTION[garmentKey] || 0) : selectedLength;
    const fabricCost = selectedFabric ? (Number(selectedFabric.price_per_meter) * consumption) : 0;
    const embroideryCost = selectedDesign?.base_price || 0;
    const stitchingCost = isStitching ? STITCHING_BASE_COST : 0;
    const garmentBasePrice = isStitching ? (GARMENT_BASE_PRICES[garmentKey] || 0) : 0;

    const totalPrice = embroideryCost + fabricCost + stitchingCost + garmentBasePrice;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setMounted(true);
        if (!router.isReady) return;

        async function fetchData() {
            setIsLoading(true);
            try {
                // 1. Fetch Design
                if (designId) {
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
                            default: imageColor = 'bg-slate-100';
                        }
                        setSelectedDesign({
                            id: designData.id,
                            name: designData.title,
                            category: designData.category,
                            image: imageColor,
                            base_price: Number(designData.base_price) || 1200,
                            descriptor: designData.short_description || '',
                            long_description: designData.long_description,
                            fabric_suitability: designData.fabric_suitability,
                            complexity: designData.complexity,
                        });
                    }
                }

                // 2. Fetch Fabrics
                const { data: fabricData } = await supabase.from('fabrics').select('*');
                if (fabricData) setFabrics(fabricData);

                // 3. Fetch Colors
                const { data: colorData } = await supabase.from('fabric_colors').select('*');
                if (colorData) {
                    setColors(colorData.map(c => ({
                        id: c.id,
                        name: c.name,
                        hex: c.hex_code
                    })));
                }

                // 4. Fetch Addresses (New)
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                if (currentUser) {
                    const { data: addressData } = await supabase
                        .from('addresses')
                        .select('*')
                        .eq('user_id', currentUser.id)
                        .order('is_default', { ascending: false })
                        .order('created_at', { ascending: false });

                    if (addressData) {
                        setAddresses(addressData);
                        // Auto-select default
                        const defaultAddr = addressData.find((a: any) => a.is_default);
                        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
                        else if (addressData.length > 0) setSelectedAddressId(addressData[0].id);
                    }
                }

            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [router.isReady, designId]);

    if (!mounted) return null;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F7F3]">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-[#C9A14A]" size={32} />
                    <p className="text-[#555555] text-sm">Loading details...</p>
                </div>
            </div>
        );
    }

    if (!selectedDesign) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F7F3]">
                <p className="text-[#555555]">Design details not found.</p>
            </div>
        );
    }

    const handleEdit = (step: string) => {
        switch (step) {
            case 'fabric':
                router.push({ pathname: '/embroidery-fabric-selection', query: router.query });
                break;
            case 'color':
                router.push({ pathname: '/embroidery-color-selection', query: router.query });
                break;
            case 'size':
                router.push({ pathname: '/embroidery-sizing', query: router.query });
                break;
            case 'garment':
                router.push({ pathname: '/embroidery-garment-selection', query: router.query });
                break;
            default:
                router.back();
        }
    };


    const handleAddToBag = async () => {
        const { editId, lengthId } = router.query;
        setIsLoading(true);

        try {
            // Prepare Data for order_drafts
            const draftData: any = {
                user_id: user?.id || null, // Nullable for guest
                service_type: isStitching ? 'embroidery_stitching' : 'cloth_only',
                design_id: selectedDesign?.id,
                fabric_id: selectedFabric?.id,
                color_id: selectedColor?.id,
                estimated_price: totalPrice,
                quantity: 1,
                status: 'draft',
                garment_type_id: isStitching ? (router.query.garmentId || null) : null,
                fabric_length_id: !isStitching ? (lengthId || null) : null,
                custom_measurements: !isStitching && !lengthId ? { length: selectedLength } : null,
                address_id: selectedAddressId // New Field
            };

            // Insert into Supabase
            const { data, error } = await supabase
                .from('order_drafts')
                .insert(draftData)
                .select()
                .single();

            if (error) throw error;

            window.dispatchEvent(new Event('bagUpdated'));

            // Show Feedback
            alert("Added to Bag!");
            router.push('/shopping-bag');

        } catch (err) {
            console.error("Error adding to bag:", err);
            alert("Failed to add to bag. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-32 pt-[64px] md:pt-[68px] lg:pt-[72px]">
            <Head>
                <title>Order Summary | Amma Embroidery</title>
            </Head>

            {/* --- Sticky Top Bar --- */}
            <div className="sticky top-0 left-0 right-0 bg-[#F9F7F3]/90 backdrop-blur-md z-40 px-4 h-[60px] flex items-center justify-center border-b border-[#E8E6E0]">
                <h1 className="font-serif text-lg text-[#1C1C1C]">
                    Order Summary
                </h1>
            </div>

            <div className="max-w-md mx-auto px-4 py-6 space-y-8">

                {/* --- Design Card --- */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-4 shadow-sm border border-[#E8E6E0] flex items-center gap-4"
                >
                    <div className="w-16 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative">
                        <div className={`absolute inset-0 ${selectedDesign.image} opacity-50`} />
                        <div className="absolute inset-0 flex items-center justify-center text-[#999] text-[10px] text-center p-1">
                            Preview
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#999] font-medium mb-1">selected design</p>
                        <h3 className="font-serif text-lg text-[#1C1C1C] leading-tight mb-0.5">{selectedDesign.name}</h3>
                        {/* Show Garment type if stitching logic, else category */}
                        <p className="text-sm text-[#5A5751]">
                            {isStitching ? garmentName : selectedDesign.category}
                        </p>
                    </div>
                </motion.div>

                {/* --- Configuration Details --- */}
                <section>
                    <h2 className="font-serif text-xl border-b border-[#E8E6E0] pb-2 mb-4">Your Customization</h2>

                    <div className="space-y-5">

                        {/* Garment Type (Stitching Only) */}
                        {isStitching && (
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-[#999] uppercase tracking-wide mb-1">Garment</p>
                                    <p className="font-medium text-[#1C1C1C]">{garmentName}</p>
                                </div>
                                <button onClick={() => handleEdit('garment')} className="text-xs font-medium text-[#C9A14A] hover:text-[#B89240] py-1 px-2 -mr-2">Edit</button>
                            </div>
                        )}

                        {/* Fabric Row */}
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-[#999] uppercase tracking-wide mb-1">Fabric</p>
                                <p className="font-medium text-[#1C1C1C]">{selectedFabric?.name || 'Not Selected'}</p>
                            </div>
                            <button onClick={() => handleEdit('fabric')} className="text-xs font-medium text-[#C9A14A] hover:text-[#B89240] py-1 px-2 -mr-2">Edit</button>
                        </div>

                        {/* Color Row */}
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-[#999] uppercase tracking-wide mb-1">Color</p>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded-full border border-gray-200"
                                        style={{ backgroundColor: selectedColor?.hex || '#ccc' }}
                                    />
                                    <p className="font-medium text-[#1C1C1C]">{selectedColor?.name || 'Not Selected'}</p>
                                </div>
                            </div>
                            <button onClick={() => handleEdit('color')} className="text-xs font-medium text-[#C9A14A] hover:text-[#B89240] py-1 px-2 -mr-2">Edit</button>
                        </div>

                        {/* Size/Length Row */}
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-[#999] uppercase tracking-wide mb-1">
                                    {isStitching ? 'Size' : 'Length'}
                                </p>
                                <p className="font-medium text-[#1C1C1C]">
                                    {isStitching ? sizeDisplay : `${selectedLength} meters`}
                                </p>
                                {(sizeDetails && sizeType === 'custom') && (
                                    <p className="text-[10px] text-[#777] mt-1 line-clamp-1">
                                        {'Custom Fit'}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => handleEdit(isStitching ? 'size' : 'length')} className="text-xs font-medium text-[#C9A14A] hover:text-[#B89240] py-1 px-2 -mr-2">Edit</button>
                        </div>

                        {/* Stitching Included */}
                        {isStitching && (
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-[#999] uppercase tracking-wide mb-1">Stitching</p>
                                    <p className="font-medium text-[#1C1C1C]">Expert Tailoring Included</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* --- Address Selection (NEW) --- */}
                {user && (
                    <section className="bg-white rounded-xl p-5 border border-[#E8E6E0]">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-serif text-lg">Delivery Location</h2>
                            {selectedAddress && (
                                <button onClick={() => setShowAddressModal(true)} className="text-[#C9A14A] text-xs font-medium uppercase">Change</button>
                            )}
                        </div>

                        {selectedAddress ? (
                            <div className="flex items-start gap-3">
                                <MapPin className="text-[#555] mt-0.5" size={18} />
                                <div>
                                    <p className="text-sm font-medium text-[#1C1C1C]">{selectedAddress.full_name}</p>
                                    <p className="text-xs text-[#555] leading-relaxed mt-1">
                                        {selectedAddress.address_line1}, {selectedAddress.city} - {selectedAddress.pincode}
                                    </p>
                                    <span className="text-[10px] bg-[#F9F7F3] border border-gray-200 px-1.5 py-0.5 rounded text-[#777] uppercase mt-1.5 inline-block">
                                        {selectedAddress.address_type}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-[#777] mb-3">No address selected.</p>
                                <button
                                    onClick={() => router.push('/saved-addresses')}
                                    className="text-xs bg-[#F9F7F3] border border-[#E6E6E6] px-4 py-2 rounded-full font-medium inline-flex items-center gap-1 hover:bg-[#EAE8E4]"
                                >
                                    <Plus size={14} /> Add Address
                                </button>
                            </div>
                        )}
                    </section>
                )}


                {/* --- Price Breakdown --- */}
                <section className="bg-white rounded-xl p-5 border border-[#E8E6E0]">
                    <h2 className="font-serif text-lg mb-4">Price Details</h2>

                    <div className="space-y-3 text-sm">
                        {isStitching && (
                            <div className="flex justify-between text-[#5A5751]">
                                <span>Base Garment Price</span>
                                <span>₹{garmentBasePrice.toLocaleString()}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-[#5A5751]">
                            <span>Embroidery Cost</span>
                            <span>₹{embroideryCost.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between text-[#5A5751]">
                            <span>Fabric Cost {isStitching && '(Estimated)'}</span>
                            <span>₹{fabricCost.toLocaleString()}</span>
                        </div>

                        {isStitching && (
                            <div className="flex justify-between text-[#5A5751]">
                                <span>Stitching & Finishing</span>
                                <span>₹{stitchingCost.toLocaleString()}</span>
                            </div>
                        )}

                        <div className="h-px bg-[#E8E6E0] my-2" />

                        <div className="flex justify-between items-center bg-[#F9F7F3] -mx-5 -mb-5 p-5 mt-4 rounded-b-xl border-t border-[#E8E6E0]">
                            <div className="flex flex-col">
                                <span className="font-serif text-lg text-[#1C1C1C]">Total</span>
                                <span className="text-[10px] text-[#999] font-normal">Inclusive of all taxes</span>
                            </div>
                            <span className="font-serif text-xl text-[#C9A14A]">₹{totalPrice.toLocaleString()}</span>
                        </div>
                    </div>
                </section>

                <p className="text-xs text-center text-[#999] mt-2">
                    Final price confirmed before stitching begins.
                </p>

            </div>

            {/* --- Sticky CTA Section --- */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E6E0] p-4 pb-8 safe-area-pb shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-md mx-auto flex flex-col gap-3">
                    <div className="flex justify-between items-end mb-1">
                        <div>
                            <p className="text-xs text-[#777]">Total Payable</p>
                        </div>
                        <div className="text-2xl font-serif text-[#1C1C1C]">
                            ₹{totalPrice.toLocaleString()}
                        </div>
                    </div>

                    <button
                        onClick={handleAddToBag}
                        className="w-full py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 bg-[#C9A14A] text-white shadow-lg shadow-[#C9A14A]/30 hover:bg-[#B89240] transform active:scale-[0.98] transition-all duration-300"
                    >
                        <span>Add to Bag</span>
                        <ShoppingBag size={18} />
                    </button>

                    <button onClick={() => router.push('/shopping-bag')} className="text-xs text-[#999] text-center mt-1 underline decoration-gray-300 underline-offset-2">
                        View Bag
                    </button>
                </div>
            </div>

            {/* Address Selection Modal */}
            <AnimatePresence>
                {showAddressModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center pt-10"
                        onClick={() => setShowAddressModal(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white w-full max-h-[85vh] sm:max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-serif text-lg">Select Address</h3>
                                <button onClick={() => setShowAddressModal(false)} className="text-2xl leading-none">&times;</button>
                            </div>

                            <div className="p-4 overflow-y-auto space-y-3 flex-1">
                                {addresses.map(addr => (
                                    <div
                                        key={addr.id}
                                        onClick={() => { setSelectedAddressId(addr.id); setShowAddressModal(false); }}
                                        className={`p-4 rounded-xl border cursor-pointer border-gray-200 hover:border-[#C9A14A] transition-colors relative ${selectedAddressId === addr.id ? 'border-[#C9A14A] bg-[#FFFBF2]' : 'bg-white'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center ${selectedAddressId === addr.id ? 'border-[#C9A14A]' : 'border-gray-300'}`}>
                                                {selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-[#C9A14A]" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-[#1C1C1C]">{addr.full_name}</p>
                                                <p className="text-xs text-[#555] mt-1">{addr.address_line1}, {addr.city} - {addr.pincode}</p>
                                                <p className="text-[10px] text-[#999] mt-1 uppercase">{addr.address_type}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => { router.push('/saved-addresses'); setShowAddressModal(false); }}
                                    className="w-full py-3 rounded-xl border border-dashed border-[#C9A14A] text-[#C9A14A] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#FFFBF2]"
                                >
                                    <Plus size={16} /> Add New Address
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
