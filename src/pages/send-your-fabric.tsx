import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Check, Package, MapPin, Plus, Loader2, FileText, ChevronRight, Ruler, Palette, Sparkles } from 'lucide-react';
import CheckoutBreadcrumbs from '@/components/CheckoutBreadcrumbs';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, orderBy, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Interfaces
interface Address {
    id: string;
    full_name: string;
    phone: string;
    address_line1: string;
    city: string;
    pincode: string;
    state: string;
    address_type: string;
    created_at?: string;
}

interface StandardSize {
    id: string;
    label: string;
    order: number;
}

const FABRIC_SUGGESTIONS = ['Cotton', 'Silk', 'Georgette', 'Chiffon', 'Velvet', 'Organza'];

export default function SendYourFabricPage() {
    const router = useRouter();
    const { designId } = router.query;
    const [mounted, setMounted] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    // Data State
    const [loadingDesign, setLoadingDesign] = useState(true);
    const [selectedDesign, setSelectedDesign] = useState<any>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [standardSizes, setStandardSizes] = useState<StandardSize[]>([]);

    // Sizing State
    const [sizeMode, setSizeMode] = useState<'standard' | 'custom'>('standard');
    const [selectedSizeId, setSelectedSizeId] = useState<string>('');
    const [customMeasurements, setCustomMeasurements] = useState({
        bust: '',
        waist: '',
        hip: '',
        shoulder: '',
        sleeveLength: '',
        garmentLength: '',
    });

    // Form State
    const [formData, setFormData] = useState({
        fabric_type: '',
        color: '',
        length: '',
        notes: '',
        processing_type: 'embroidery_only' // 'embroidery_only' | 'embroidery_stitching'
    });

    const [newAddress, setNewAddress] = useState({
        full_name: '',
        phone: '',
        address_line1: '',
        city: '',
        pincode: '',
        state: 'India',
        address_type: 'pickup'
    });

    // UI State
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handlers
    const handleFabricChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSuggestionClick = (fabric: string) => {
        setFormData(prev => ({ ...prev, fabric_type: fabric }));
    };

    const handleMeasurementChange = (field: string, value: string) => {
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setCustomMeasurements(prev => ({ ...prev, [field]: value }));
        }
    };

    // Auth Protection
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);


    // Fetch Design and Addresses
    useEffect(() => {
        if (!router.isReady || !designId) return;

        async function initData() {
            setLoadingDesign(true);
            try {
                // 1. Fetch Design
                const docRef = doc(db, 'designs', designId as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const designData = docSnap.data();
                    let imageColor = 'bg-gray-50';
                    switch (designData.category) {
                        case 'Floral': imageColor = 'bg-rose-100'; break;
                        case 'Traditional': imageColor = 'bg-amber-100'; break;
                        case 'Modern': imageColor = 'bg-slate-100'; break;
                        default: imageColor = 'bg-gray-50';
                    }
                    setSelectedDesign({
                        id: docSnap.id,
                        name: designData.name || designData.title,
                        category: designData.category,
                        image: designData.image || imageColor,
                        descriptor: designData.short_description || designData.descriptor,
                        base_price: Number(designData.base_price),
                        fabric_suitability: designData.fabric_suitability
                    } as any);
                }

                // 2. Fetch Addresses
                if (auth.currentUser) {
                    const addrRef = collection(db, 'users', auth.currentUser.uid, 'addresses');
                    const addrSnap = await getDocs(addrRef);
                    const fetchedAddr: Address[] = [];
                    addrSnap.forEach(d => {
                        const data = d.data();
                        if (data.address_type === 'pickup' || data.address_type === 'both') {
                            fetchedAddr.push({ id: d.id, ...data } as Address);
                        }
                    });

                    // Sort descending createdAt
                    fetchedAddr.sort((a: any, b: any) => {
                        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                        return dateB - dateA;
                    });

                    if (fetchedAddr.length > 0) {
                        setAddresses(fetchedAddr);
                        setSelectedAddressId(fetchedAddr[0].id);
                    }

                }

                // 3. Fetch Standard Sizes
                const sizesRef = collection(db, 'standard_sizes');
                let sizesSnap = await getDocs(query(sizesRef, orderBy('order', 'asc')));

                // Auto-seed if empty
                if (sizesSnap.empty) {
                    const DEFAULTS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
                    const batch = writeBatch(db); // Ensure writeBatch is imported

                    for (let i = 0; i < DEFAULTS.length; i++) {
                        const newRef = doc(sizesRef);
                        batch.set(newRef, {
                            label: DEFAULTS[i],
                            order: i,
                            created_at: new Date().toISOString()
                        });
                    }
                    await batch.commit();

                    // Re-fetch
                    sizesSnap = await getDocs(query(sizesRef, orderBy('order', 'asc')));
                }

                const sizes: StandardSize[] = [];
                sizesSnap.forEach(doc => {
                    sizes.push({ id: doc.id, ...doc.data() } as StandardSize);
                });
                setStandardSizes(sizes);

            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoadingDesign(false);
            }
        }

        initData();
    }, [router.isReady, designId]);

    const handleSaveAddress = async () => {
        setIsAddingAddress(true);
        try {
            if (!auth.currentUser) throw new Error("Not authenticated");

            const addressRef = collection(db, 'users', auth.currentUser.uid, 'addresses');
            const newAddrPayload = {
                ...newAddress,
                address_line2: '',
                state: 'India',
                is_default: false,
                created_at: new Date().toISOString()
            };

            const docRef = await addDoc(addressRef, newAddrPayload);
            const savedAddr = { id: docRef.id, ...newAddrPayload } as any;

            setAddresses([savedAddr, ...addresses]);
            setSelectedAddressId(docRef.id);
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
            if (!auth.currentUser) throw new Error("Not authenticated");

            // Create new draft for every request
            const draftsRef = collection(db, 'users', auth.currentUser.uid, 'drafts');

            const draftPayload = {
                service_type: 'send_your_fabric',
                design_id: designId,
                pickup_address_id: selectedAddressId,
                fabric_details: {
                    fabric_type: formData.fabric_type,
                    color: formData.color,
                    length: formData.length,
                    notes: formData.notes,
                    processing_type: formData.processing_type,
                    standard_size_id: (formData.processing_type === 'embroidery_stitching' && sizeMode === 'standard') ? selectedSizeId : null,
                    custom_measurements: (formData.processing_type === 'embroidery_stitching' && sizeMode === 'custom') ? customMeasurements : null
                },
                estimated_price: selectedDesign?.base_price || 0,
                quantity: 1,
                status: 'draft',
                updated_at: new Date().toISOString(),
                created_at: new Date().toISOString()
            };

            await addDoc(draftsRef, draftPayload);

            router.push('/shopping-bag');

        } catch (err) {
            console.error("Submission error:", err);
            alert("Failed to submit request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);

    const isCustomValid = Object.values(customMeasurements).every(val => val.trim() !== '' && !isNaN(Number(val)));
    const isSizeValid = formData.processing_type === 'embroidery_only'
        ? true
        : (sizeMode === 'standard' ? !!selectedSizeId : isCustomValid);

    const isFormValid = formData.fabric_type && selectedAddressId && isSizeValid;

    if (!mounted) return null;
    if (authLoading || loadingDesign) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9F7F3]">
            <Loader2 className="animate-spin text-[#C9A14A]" size={32} />
        </div>
    );



    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-32 pt-[64px] md:pt-[72px]">
            <Head><title>Send Your Fabric | Amma Embroidery</title></Head>

            <div className="w-full max-w-7xl mx-auto px-4 mt-8 mb-6 flex justify-center">
                <CheckoutBreadcrumbs
                    currentStep="customize"
                    designId={designId as string}
                    serviceType="send_fabric"
                />
            </div>

            <div className="max-w-md mx-auto px-4 space-y-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <span className="text-[10px] font-bold tracking-widest text-[#C9A14A] uppercase mb-2 block">Premium Service</span>
                    <h1 className="font-serif text-3xl text-[#1C1C1C] mb-2">Send Your Fabric</h1>
                    <p className="font-sans text-[#555] text-sm max-w-xs mx-auto">
                        We'll craft your masterpiece using your own trusted material.
                    </p>
                </motion.div>

                {/* Selected Design Card */}
                {selectedDesign && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center relative overflow-hidden group"
                    >
                        {/* Abstract BG Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A14A]/5 rounded-full blur-2xl -mr-10 -mt-10" />

                        <div className="w-20 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative shadow-inner">
                            <div className={`absolute inset-0 ${selectedDesign.image} bg-cover bg-center`} />
                        </div>
                        <div className="flex-1 relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles size={12} className="text-[#C9A14A]" />
                                <span className="text-[10px] uppercase tracking-wider text-[#999] font-medium">Concept</span>
                            </div>
                            <h3 className="font-serif text-lg text-[#1C1C1C] leading-tight mb-1">{selectedDesign.name}</h3>
                            <p className="text-xs text-[#555]">{selectedDesign.category}</p>
                        </div>
                    </motion.div>
                )}

                {/* Section 0: Service Type Selection */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-[#1C1C1C] flex items-center justify-center text-white text-xs font-serif">1</div>
                        <h2 className="font-serif text-lg text-[#1C1C1C]">Service Options</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Embroidery Only */}
                        <div
                            onClick={() => setFormData(prev => ({ ...prev, processing_type: 'embroidery_only' }))}
                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${formData.processing_type === 'embroidery_only' ? 'border-[#C9A14A] bg-white shadow-md' : 'border-gray-100 bg-white/50 hover:border-gray-200'}`}
                        >
                            {formData.processing_type === 'embroidery_only' && <div className="absolute top-3 right-3 text-[#C9A14A]"><Check size={16} /></div>}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${formData.processing_type === 'embroidery_only' ? 'bg-[#FFFBF2] text-[#C9A14A]' : 'bg-gray-100 text-gray-400'}`}>
                                <Sparkles size={20} />
                            </div>
                            <h3 className="font-serif text-base text-[#1C1C1C] mb-1">Embroidery Only</h3>
                            <p className="text-xs text-[#555] leading-relaxed">We will embroider your fabric and send it back to you.</p>
                        </div>

                        {/* Embroidery + Stitching */}
                        <div
                            onClick={() => setFormData(prev => ({ ...prev, processing_type: 'embroidery_stitching' }))}
                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${formData.processing_type === 'embroidery_stitching' ? 'border-[#C9A14A] bg-white shadow-md' : 'border-gray-100 bg-white/50 hover:border-gray-200'}`}
                        >
                            {formData.processing_type === 'embroidery_stitching' && <div className="absolute top-3 right-3 text-[#C9A14A]"><Check size={16} /></div>}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${formData.processing_type === 'embroidery_stitching' ? 'bg-[#FFFBF2] text-[#C9A14A]' : 'bg-gray-100 text-gray-400'}`}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                            </div>
                            <h3 className="font-serif text-base text-[#1C1C1C] mb-1">With Stitching</h3>
                            <p className="text-xs text-[#555] leading-relaxed">Full garment stitching according to your measurements.</p>
                        </div>
                    </div>
                </motion.section>

                {/* Section (1b): Size Selection (Conditional) */}
                <AnimatePresence>
                    {formData.processing_type === 'embroidery_stitching' && (
                        <motion.section
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-full bg-[#1C1C1C] flex items-center justify-center text-white text-xs font-serif">2</div>
                                <h2 className="font-serif text-lg text-[#1C1C1C]">Select Size</h2>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

                                {/* Mode Toggle */}
                                <div className="flex bg-gray-50 p-1 rounded-xl mb-6">
                                    {['standard', 'custom'].map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setSizeMode(m as any)}
                                            className={`
                                                flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300
                                                ${sizeMode === m
                                                    ? 'bg-white text-[#1C1C1C] shadow-sm'
                                                    : 'text-gray-400 hover:text-gray-600'}
                                            `}
                                        >
                                            {m === 'standard' ? 'Standard Size' : 'Custom Measurements'}
                                        </button>
                                    ))}
                                </div>

                                <AnimatePresence mode="wait">
                                    {sizeMode === 'standard' ? (
                                        <motion.div
                                            key="standard"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                                                {standardSizes.map((size) => (
                                                    <button
                                                        key={size.id}
                                                        onClick={() => setSelectedSizeId(size.id)}
                                                        className={`
                                                            py-3 rounded-xl text-sm font-medium border transition-all relative overflow-hidden group
                                                            ${selectedSizeId === size.id
                                                                ? 'bg-[#1C1C1C] text-white border-[#1C1C1C] shadow-lg shadow-black/10'
                                                                : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                                            }
                                                        `}
                                                    >
                                                        {selectedSizeId === size.id && <div className="absolute inset-0 bg-white/10" />}
                                                        {size.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="mt-4 flex items-center justify-between text-xs text-[#999]">
                                                <span className="flex items-center gap-1"><Ruler size={12} /> Standard Sizing</span>
                                                <button className="underline hover:text-[#C9A14A]">View Size Chart</button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="custom"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-4"
                                        >
                                            <div className="grid grid-cols-2 gap-4">
                                                {Object.keys(customMeasurements).map((key) => (
                                                    <div key={key} className="space-y-1">
                                                        <label className="text-[10px] font-bold text-[#999] ml-1 uppercase tracking-wide">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()} (cm)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            value={(customMeasurements as any)[key]}
                                                            onChange={(e) => handleMeasurementChange(key, e.target.value)}
                                                            placeholder="0"
                                                            className="w-full bg-white border-b-2 border-gray-100 py-2 px-1 text-sm font-medium text-[#1C1C1C] focus:border-[#C9A14A] outline-none transition-all rounded-none placeholder:font-normal placeholder:text-gray-300"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200 mt-2">
                                                <p className="text-[10px] text-[#777] italic">Our tailors review every measurement for the perfect fit.</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Section 1: Fabric Details */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-[#1C1C1C] flex items-center justify-center text-white text-xs font-serif">{formData.processing_type === 'embroidery_stitching' ? 3 : 2}</div>
                        <h2 className="font-serif text-lg text-[#1C1C1C]">Fabric Details</h2>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
                        {/* Fabric Type */}
                        <div>
                            <label className="text-xs font-bold text-[#555] mb-2 uppercase tracking-wide flex items-center gap-1">
                                <Package size={14} /> Fabric Type
                            </label>
                            <input
                                type="text"
                                name="fabric_type"
                                value={formData.fabric_type}
                                onChange={handleFabricChange}
                                placeholder="What material are you sending?"
                                className="w-full p-3 border-b-2 border-gray-100 bg-transparent text-sm font-medium focus:border-[#C9A14A] outline-none transition-colors placeholder:font-normal"
                            />
                            {/* Suggestions */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {FABRIC_SUGGESTIONS.map(fabric => (
                                    <button
                                        key={fabric}
                                        onClick={() => handleSuggestionClick(fabric)}
                                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${formData.fabric_type === fabric ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-300'}`}
                                    >
                                        {fabric}
                                    </button>
                                ))}
                            </div>
                        </div>



                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="text-xs font-bold text-[#555] mb-2 uppercase tracking-wide flex items-center gap-1">
                                    <Palette size={14} /> Color
                                </label>
                                <input
                                    type="text"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleFabricChange}
                                    placeholder="e.g. Red"
                                    className="w-full p-3 border-b-2 border-gray-100 bg-transparent text-sm font-medium focus:border-[#C9A14A] outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[#555] mb-2 uppercase tracking-wide flex items-center gap-1">
                                    <Ruler size={14} /> Length
                                </label>
                                <input
                                    type="text"
                                    name="length"
                                    value={formData.length}
                                    onChange={handleFabricChange}
                                    placeholder="e.g. 2.5m"
                                    className="w-full p-3 border-b-2 border-gray-100 bg-transparent text-sm font-medium focus:border-[#C9A14A] outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-[#555] mb-2 uppercase tracking-wide flex items-center gap-1">
                                <FileText size={14} /> Notes
                            </label>
                            <textarea
                                name="notes"
                                rows={2}
                                value={formData.notes}
                                onChange={handleFabricChange}
                                placeholder="Any special care instructions?"
                                className="w-full p-3 rounded-xl bg-gray-50 border-none text-sm outline-none focus:ring-1 focus:ring-[#C9A14A] resize-none"
                            />
                        </div>
                    </div>
                </motion.section>

                {/* Section 2: Pickup Address */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#1C1C1C] flex items-center justify-center text-white text-xs font-serif">{formData.processing_type === 'embroidery_stitching' ? 4 : 3}</div>
                            <h2 className="font-serif text-lg text-[#1C1C1C]">Pickup From</h2>
                        </div>
                        {selectedAddress && (
                            <button onClick={() => setShowAddressModal(true)} className="text-[#C9A14A] text-xs font-bold uppercase tracking-wide hover:underline">Change</button>
                        )}
                    </div>

                    {selectedAddress ? (
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C9A14A]" />
                            <div className="mt-1 p-2 bg-[#F9F7F3] rounded-full text-[#C9A14A]">
                                <Truck size={20} />
                            </div>
                            <div>
                                <p className="font-serif text-base text-[#1C1C1C]">{selectedAddress.full_name}</p>
                                <p className="text-sm text-[#555] mt-1 leading-relaxed">
                                    {selectedAddress.address_line1}, {selectedAddress.city} - {selectedAddress.pincode}
                                </p>
                                <p className="text-xs text-[#999] mt-1">Phone: {selectedAddress.phone}</p>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowAddressModal(true)}
                            className="w-full bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#C9A14A] hover:bg-[#FFFBF2] transition-all group duration-300"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#F9F7F3] group-hover:bg-[#C9A14A]/10 flex items-center justify-center text-[#999] group-hover:text-[#C9A14A] mb-3 transition-colors">
                                <Plus size={24} />
                            </div>
                            <p className="font-medium text-[#1C1C1C]">Add Pickup Address</p>
                            <p className="text-xs text-[#777] mt-1">We'll pick up from this location</p>
                        </button>
                    )}
                </motion.section>
            </div>

            {/* Sticky CTA with Glassmorphism */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-white/20 p-4 pb-8 safe-area-pb shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={handleSubmit}
                        disabled={!isFormValid || isSubmitting}
                        className={`
                            w-full py-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300
                            ${!isFormValid
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-[#C9A14A] text-white shadow-lg shadow-[#C9A14A]/30 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]'
                            }
                        `}
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <span className="tracking-wide uppercase text-xs font-bold">Add to Bag</span>
                                <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                    <p className="text-[10px] text-center text-[#999] mt-3 flex items-center justify-center gap-1">
                        <Truck size={10} /> Pickup fee calculated at confirmation
                    </p>
                </div>
            </div>

            {/* Address Modal */}
            <AnimatePresence>
                {showAddressModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center pt-10"
                        onClick={() => setShowAddressModal(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white w-full max-h-[90vh] sm:max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <h3 className="font-serif text-xl">Select Address</h3>
                                <button onClick={() => setShowAddressModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">&times;</button>
                            </div>

                            <div className="p-5 overflow-y-auto flex-1 space-y-8">
                                {addresses.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-[#999] uppercase tracking-wide">Saved Locations</p>
                                        {addresses.map(addr => (
                                            <div
                                                key={addr.id}
                                                onClick={() => { setSelectedAddressId(addr.id); setShowAddressModal(false); }}
                                                className={`p-4 rounded-xl border-2 cursor-pointer flex items-start gap-4 transition-all ${selectedAddressId === addr.id ? 'border-[#C9A14A] bg-[#FFFBF2]' : 'border-gray-100 hover:border-gray-200'}`}
                                            >
                                                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${selectedAddressId === addr.id ? 'border-[#C9A14A]' : 'border-gray-300'}`}>
                                                    {selectedAddressId === addr.id && <div className="w-2.5 h-2.5 rounded-full bg-[#C9A14A]" />}
                                                </div>
                                                <div>
                                                    <p className="font-serif text-[#1C1C1C]">{addr.full_name}</p>
                                                    <p className="text-xs text-[#555] mt-1 leading-relaxed">{addr.address_line1}, {addr.city}</p>
                                                    <p className="text-[10px] text-[#999] mt-1">{addr.phone}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add New Form */}
                                <div>
                                    <p className="text-xs font-bold text-[#999] uppercase tracking-wide mb-4">Add New Location</p>
                                    <div className="space-y-4">
                                        <input name="full_name" placeholder="Contact Name" value={newAddress.full_name} onChange={handleNewAddressChange} className="w-full p-4 rounded-xl bg-gray-50 border-none text-sm outline-none focus:ring-1 focus:ring-[#C9A14A] transition-all placeholder:text-gray-400" />
                                        <input name="phone" placeholder="Phone Number" value={newAddress.phone} onChange={handleNewAddressChange} className="w-full p-4 rounded-xl bg-gray-50 border-none text-sm outline-none focus:ring-1 focus:ring-[#C9A14A] transition-all placeholder:text-gray-400" />
                                        <input name="address_line1" placeholder="Address (House No, Street)" value={newAddress.address_line1} onChange={handleNewAddressChange} className="w-full p-4 rounded-xl bg-gray-50 border-none text-sm outline-none focus:ring-1 focus:ring-[#C9A14A] transition-all placeholder:text-gray-400" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input name="city" placeholder="City" value={newAddress.city} onChange={handleNewAddressChange} className="w-full p-4 rounded-xl bg-gray-50 border-none text-sm outline-none focus:ring-1 focus:ring-[#C9A14A] transition-all placeholder:text-gray-400" />
                                            <input name="pincode" placeholder="Pincode" value={newAddress.pincode} onChange={handleNewAddressChange} className="w-full p-4 rounded-xl bg-gray-50 border-none text-sm outline-none focus:ring-1 focus:ring-[#C9A14A] transition-all placeholder:text-gray-400" />
                                        </div>
                                        <button
                                            onClick={handleSaveAddress}
                                            disabled={!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || isAddingAddress}
                                            className="w-full py-4 rounded-xl bg-[#1C1C1C] text-white font-medium text-sm disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
                                        >
                                            {isAddingAddress ? 'Saving...' : 'Save Address'}
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
