import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ChevronLeft, User, Smartphone, Camera, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

export default function EditProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth(); // We might want a refreshUser function in AuthContext
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
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error('No authenticated user found');

            // 1. Update Firebase Auth Profile (Display Name)
            if (name !== currentUser.displayName) {
                await updateProfile(currentUser, {
                    displayName: name
                });
            }

            // 2. Update Firestore User Document
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, {
                full_name: name,
                phone: phone,
                updated_at: new Date().toISOString()
            }, { merge: true });

            alert("Profile updated successfully.");

            // Force reload to sync Context (which fetches from Firestore on init)
            // Ideally we'd have a setUser/updateUser in context exposed to avoid reload
            // But this is safe for now.
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
            <header className="w-full bg-[#F9F7F3] h-[90px] flex items-center px-4 pt-6 sticky top-0 z-10">

                <div className="flex-1 text-center">
                    <h1 className="text-3xl font-serif font-light text-[#1C1C1C] tracking-wide relative top-1">
                        Edit Profile
                    </h1>
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 py-4 mt-8">

                {/* Avatar Placeholder */}
                <div className="flex flex-col items-center mb-16">
                    <div className="relative w-28 h-28 rounded-none bg-[#1C1C1C] text-white flex items-center justify-center font-serif text-5xl shadow-none">
                        {name ? name[0].toUpperCase() : 'U'}
                        <button className="absolute -bottom-3 -right-3 p-3 bg-[#F9F7F3] hover:bg-white transition-colors text-[#1C1C1C] rounded-none border border-[#E8E6E0]">
                            <Camera size={16} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="relative group">
                        <label className="absolute -top-5 left-0 text-[9px] uppercase tracking-[0.1em] text-[#1C1C1C] font-medium pointer-events-none transition-all">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-transparent border-b border-[#E8E6E0] rounded-none px-0 py-3 text-[#1C1C1C] outline-none hover:border-[#CCCCCC] focus:border-[#1C1C1C] transition-all duration-300 placeholder:text-transparent"
                            placeholder="Full Name"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <label className="absolute -top-5 left-0 text-[9px] uppercase tracking-[0.1em] text-[#1C1C1C] font-medium pointer-events-none transition-all">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-transparent border-b border-[#E8E6E0] rounded-none px-0 py-3 text-[#1C1C1C] outline-none hover:border-[#CCCCCC] focus:border-[#1C1C1C] transition-all duration-300 placeholder:text-transparent"
                            placeholder="Phone Number"
                        />
                    </div>

                    <div className="pt-8">
                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full py-4 rounded-none bg-[#1C1C1C] text-white font-medium text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-all duration-300 hover:bg-black hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] border border-[#1C1C1C]"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-3">
                                    <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </span>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

