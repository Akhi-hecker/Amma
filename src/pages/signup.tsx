import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, MessageSquare, Chrome } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function SignupPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        mobile: '',
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isFormValid =
        formData.fullName.trim().length > 2 &&
        formData.mobile.trim().length >= 10 &&
        formData.email.trim().includes('@') &&
        formData.password.length >= 6;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid || isSubmitting) return;

        setIsSubmitting(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // Update Auth Profile
            await updateProfile(user, {
                displayName: formData.fullName
            });

            // Create User Document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                full_name: formData.fullName,
                phone: formData.mobile,
                email: formData.email,
                created_at: new Date().toISOString()
            });

            // Redirect check
            const returnPath = sessionStorage.getItem('auth_return_path');
            if (returnPath) {
                sessionStorage.removeItem('auth_return_path');
                router.push(returnPath);
            } else {
                router.push('/profile');
            }

        } catch (err: any) {
            console.error("Signup failed", err);
            let msg = "An unexpected error occurred";
            if (err.code === 'auth/email-already-in-use') msg = "Email already in use.";
            if (err.code === 'auth/weak-password') msg = "Password is too weak.";
            alert(msg);
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            // AuthContext listener will handle the rest (creating profile if missing)
            // But good to manually ensure redirects here if needed

            const returnPath = sessionStorage.getItem('auth_return_path');
            if (returnPath) {
                sessionStorage.removeItem('auth_return_path');
                router.push(returnPath);
            } else {
                router.push('/profile');
            }

        } catch (error: any) {
            console.error("Google signup error:", error);
            alert(error.message || "Failed to sign up with Google");
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-20 pt-[64px] md:pt-[68px] lg:pt-[72px]">
            <Head>
                <title>Create Account | Amma Embroidery</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            </Head>

            {/* --- Top Bar --- */}
            <header className="w-full bg-[#F9F7F3] h-[72px] flex items-center px-4">
                <h1 className="flex-1 text-center text-xl font-serif text-[#1C1C1C]">
                    Create Account
                </h1>
            </header>

            <main className="max-w-md mx-auto px-6 py-4">
                <div className="mb-10">
                    <h2 className="text-2xl font-serif text-[#1C1C1C] mb-2">Welcome</h2>
                    <p className="text-[#5A5751] text-sm font-sans tracking-wide">
                        Let's set up your profile for a personalized experience.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g. Aditi Sharma"
                        required
                    />

                    <div>
                        <Input
                            label="Mobile Number"
                            name="mobile"
                            type="tel"
                            inputMode="numeric"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            placeholder="10-digit number"
                            required
                        />
                        <p className="text-[10px] text-[#999] mt-2 ml-1">
                            We'll use your number for order updates.
                        </p>
                    </div>

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="For receipts and newsletters"
                        required
                    />

                    <div className="relative">
                        <Input
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="At least 6 characters"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-[#999] p-1"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="pt-4">
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            disabled={!isFormValid || isSubmitting}
                            type="submit"
                            className={`
                                w-full py-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all
                                ${isFormValid && !isSubmitting
                                    ? 'bg-[#C9A14A] text-white shadow-lg shadow-[#C9A14A]/20'
                                    : 'bg-[#E8E6E0] text-[#999] cursor-not-allowed'}
                            `}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                                    Creating Account...
                                </span>
                            ) : (
                                "Create Account"
                            )}
                        </motion.button>
                    </div>
                </form>

                {/* --- Legal --- */}
                <div className="mt-8 text-center px-4">
                    <p className="text-[11px] text-[#999] leading-relaxed">
                        By continuing, you agree to our{' '}
                        <button className="underline decoration-[#C9A14A]/30 underline-offset-2 text-[#777]">Terms</button>
                        {' & '}
                        <button className="underline decoration-[#C9A14A]/30 underline-offset-2 text-[#777]">Privacy Policy</button>.
                    </p>
                </div>

                {/* --- Social / Future Login Placeholder --- */}
                <div className="mt-12">
                    <div className="relative flex items-center justify-center mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#E8E6E0]"></div>
                        </div>
                        <span className="relative px-4 bg-[#F9F7F3] text-[10px] uppercase tracking-widest text-[#BBB] font-medium">
                            Or continue with
                        </span>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={handleGoogleSignup}
                            className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-[#E8E6E0] bg-white text-[#5A5751] text-xs font-medium active:bg-gray-50 transition-colors w-full"
                        >
                            <Chrome size={14} />
                            Google
                        </button>
                    </div>
                </div>

                {/* --- Secondary Action --- */}
                <div className="mt-12 text-center pb-10">
                    <button
                        onClick={() => router.push('/login')}
                        className="text-sm text-[#777] font-medium transition-colors"
                    >
                        Already have an account? <span className="text-[#C9A14A]">Login</span>
                    </button>
                </div>
            </main>
        </div>
    );
}

// --- Internal Input Component (Synced with brand aesthetic) ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

function Input({ label, ...props }: InputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value && String(props.value).length > 0;

    return (
        <div className="relative">
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
                `}
                placeholder={label}
            />

            <AnimatePresence>
                {hasValue && !isFocused && props.type !== 'password' && (
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
