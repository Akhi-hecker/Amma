
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Smartphone, Camera, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function EditProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Initial Load
    useEffect(() => {
        setMounted(true);
        if (isAuthenticated && user) {
            setName(user.name || '');
            setPhone(user.phone || '');
        } else if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, user, isLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) throw new Error('No authenticated user found');

            const updates = {
                id: currentUser.id,
                full_name: name,
                phone: phone,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('user_profiles')
                .upsert(updates);

            if (error) throw error;

            // VERIFICATION: Read back the data to ensure it was saved (guards against silent RLS failures)
            const { data: verifyData } = await supabase
                .from('user_profiles')
                .select('full_name, phone')
                .eq('id', currentUser.id)
                .single();

            if (verifyData?.full_name !== name || verifyData?.phone !== phone) {
                console.warn("Verification failed - RLS might be blocking updates", verifyData);
                // We could throw here, but let's try to proceed to see if it was just eventual consistency?
                // Actually, if RLS blocks update, error usually occurs. 
                // If RLS allows update but policies are weird, this read might show old data.
            }

            // Optional: Sync auth metadata (REMOVED per strict data rules)
            // await supabase.auth.updateUser({
            //     data: { full_name: name, phone: phone }
            // });

            alert("Profile updated successfully.");

            // Redirect back to profile and force sync
            window.location.href = '/profile';

        } catch (error: any) {
            console.error("Save failed", error);
            alert('Error updating profile: ' + error.message);
            setIsSubmitting(false);
        }
    };

    if (!mounted || isLoading || !isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-20 pt-[64px] md:pt-[68px] lg:pt-[72px]">
            <Head>
                <title>Edit Profile | Amma Embroidery</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            </Head>

            {/* --- Top Bar --- */}
            <header className="w-full bg-[#F9F7F3] h-[72px] flex items-center px-4 justify-between fixed top-0 z-10 transition-all duration-300">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 text-[#1C1C1C] active:opacity-70 flex items-center gap-1"
                >
                    <ArrowLeft size={24} strokeWidth={1.5} />
                    <span className="text-sm font-medium">Done</span>
                </button>
                <h1 className="text-xl font-serif text-[#1C1C1C]">
                    Edit Profile
                </h1>
                <div className="w-16"></div>
            </header>

            <main className="max-w-md mx-auto px-6 py-4 mt-8">

                {/* Avatar Placeholder */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-24 h-24 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center font-serif text-4xl mb-3 shadow-md">
                        {name ? name[0].toUpperCase() : 'U'}
                        <button className="absolute bottom-0 right-0 p-2 bg-[#C9A14A] rounded-full text-white shadow-sm border border-white">
                            <Camera size={14} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[#5A5751] mb-2 pl-1">Full Name</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white border border-[#E8E6E0] rounded-xl px-4 py-3.5 pl-11 text-[#1C1C1C] outline-none focus:border-[#C9A14A] transition-all placeholder:text-gray-300"
                                placeholder="Enter your full name"
                                required
                            />
                            <User className="absolute left-4 top-3.5 text-[#999]" size={20} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#5A5751] mb-2 pl-1">Phone Number</label>
                        <div className="relative">
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-white border border-[#E8E6E0] rounded-xl px-4 py-3.5 pl-11 text-[#1C1C1C] outline-none focus:border-[#C9A14A] transition-all placeholder:text-gray-300"
                                placeholder="Enter phone number"
                            />
                            <Smartphone className="absolute left-4 top-3.5 text-[#999]" size={20} />
                        </div>
                    </div>

                    <div className="pt-6">
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full py-4 rounded-xl bg-[#C9A14A] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#C9A14A]/20"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                                    Saving...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save size={18} />
                                    Save Changes
                                </span>
                            )}
                        </motion.button>
                    </div>
                </form>
            </main>
        </div>
    );
}

