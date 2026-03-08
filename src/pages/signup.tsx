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
            <header className="w-full bg-[#F9F7F3] h-[90px] flex items-center px-4 pt-6 sticky top-0 z-10 justify-center">
                <h1 className="text-3xl font-serif font-light text-[#1C1C1C] tracking-wide relative top-1">
                    Create Account
                </h1>
            </header>

            <main className="max-w-md mx-auto px-6 py-8">
                <div className="mb-14 mt-4 text-center">
                    <h2 className="text-3xl font-serif font-light text-[#1C1C1C] mb-4 tracking-wide">Welcome</h2>
                    <p className="text-[#5A5751] text-[10px] uppercase tracking-[0.2em] font-medium">
                        Set up your profile
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
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
                        <p className="text-[10px] text-[#999] mt-3 ml-1 tracking-wider uppercase">
                            For order updates.
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
                            className="absolute right-0 top-3 text-[#999] hover:text-[#1C1C1C] transition-colors p-1"
                        >
                            {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                        </button>
                    </div>

                    <div className="pt-2">
                        <button
                            disabled={!isFormValid || isSubmitting}
                            type="submit"
                            className={`
                                w-full py-4 rounded-none font-medium text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-300 border
                                ${isFormValid && !isSubmitting
                                    ? 'bg-[#1C1C1C] border-[#1C1C1C] text-white hover:bg-black hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)]'
                                    : 'bg-transparent border-[#E8E6E0] text-[#999] cursor-not-allowed'}
                            `}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-3">
                                    <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating Account...
                                </span>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-10 text-center px-4">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-[#999] leading-relaxed font-medium">
                        By continuing, you agree to our{' '}
                        <button className="text-[#1C1C1C] border-b border-[#1C1C1C] pb-0.5 hover:opacity-70 transition-opacity">Terms</button>
                        {' & '}
                        <button className="text-[#1C1C1C] border-b border-[#1C1C1C] pb-0.5 hover:opacity-70 transition-opacity">Privacy</button>.
                    </p>
                </div>

                <div className="mt-14">
                    <div className="relative flex items-center justify-center mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full h-[1px] bg-[#E8E6E0]"></div>
                        </div>
                        <span className="relative px-6 bg-[#F9F7F3] text-[9px] uppercase tracking-[0.2em] text-[#999] font-medium">
                            Or continue with
                        </span>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={handleGoogleSignup}
                            className="flex items-center justify-center gap-3 py-4 px-6 rounded-none border border-[#E8E6E0] bg-transparent hover:bg-white hover:border-[#1C1C1C] text-[#1C1C1C] text-[11px] uppercase tracking-[0.2em] font-medium transition-all duration-300 w-full"
                        >
                            <Chrome size={14} strokeWidth={1.5} />
                            Google
                        </button>
                    </div>
                </div>

                {/* --- Secondary Action --- */}
                <div className="mt-12 text-center pb-10">
                    <button
                        onClick={() => router.push('/login')}
                        className="text-[10px] uppercase tracking-[0.1em] text-[#999] font-medium transition-colors hover:text-[#1C1C1C]"
                    >
                        Already have an account? <span className="text-[#1C1C1C] font-semibold border-b border-[#1C1C1C] pb-0.5 ml-1">Login</span>
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
        <div className="relative group mt-2">
            <label
                className={`
                    absolute left-0 transition-all duration-300 pointer-events-none z-10
                    ${(isFocused || hasValue)
                        ? '-top-5 text-[9px] uppercase tracking-[0.1em] text-[#1C1C1C] font-medium'
                        : 'top-3 text-sm tracking-wide text-[#999] font-light'}
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
                    w-full bg-transparent border-b rounded-none px-0 py-3 text-[#1C1C1C] outline-none transition-all duration-300
                    ${(isFocused || hasValue) ? 'border-[#1C1C1C]' : 'border-[#E8E6E0] hover:border-[#CCCCCC]'}
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
                        className="absolute right-0 top-3 text-[#1C1C1C]"
                    >
                        <Check size={16} strokeWidth={1.5} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
