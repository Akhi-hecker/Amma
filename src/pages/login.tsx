import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, MessageSquare, Chrome } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase'; // Firebase Auth
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function LoginPage() {
    const router = useRouter();
    const { login, user, isAuthenticated } = useAuth(); // Added user, isAuthenticated
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        identifier: '', // Mobile or Email
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isFormValid =
        formData.identifier.trim().length >= 4 &&
        formData.password.length >= 6;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid || isSubmitting) return;

        setIsSubmitting(true);

        try {
            // Firebase Login
            await signInWithEmailAndPassword(auth, formData.identifier, formData.password);

            // AuthContext listener handles state update.
            // We just handle redirect here.

            const returnPath = sessionStorage.getItem('auth_return_path');
            if (returnPath) {
                sessionStorage.removeItem('auth_return_path');
                router.push(returnPath);
            } else {
                router.push('/profile');
            }

        } catch (err: any) {
            console.error("Login failed", err);
            let msg = "An unknown error occurred";
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                msg = "Invalid email or password.";
            } else if (err.code === 'auth/invalid-email') {
                msg = "Invalid email address.";
            } else if (err.code === 'auth/too-many-requests') {
                msg = "Access to this account has been temporarily disabled due to many failed login attempts.";
            }
            alert(msg);
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);

            // AuthContext listener handles state update.
            // We just handle redirect here to be safe/explicit.
            const returnPath = sessionStorage.getItem('auth_return_path');
            if (returnPath) {
                sessionStorage.removeItem('auth_return_path');
                router.push(returnPath);
            } else {
                router.push('/profile');
            }

        } catch (error: any) {
            console.error("Google login error:", error);
            alert(error.message || "Failed to login with Google");
        }
    };

    // Determine if identifier is likely a phone number for keyboard hint
    const isPhoneNumber = /^\d+$/.test(formData.identifier.replace(/\s+/g, ''));

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-20 pt-[64px] md:pt-[68px] lg:pt-[72px]">
            <Head>
                <title>Login | Amma Embroidery</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            </Head>

            {/* --- Top Bar --- */}
            <header className="w-full bg-[#F9F7F3] h-[72px] flex items-center px-4">
                <h1 className="flex-1 text-center text-xl font-serif text-[#1C1C1C]">
                    Login
                </h1>
            </header>

            <main className="max-w-md mx-auto px-6 py-4">
                <div className="mb-10 mt-4">
                    <h2 className="text-2xl font-serif text-[#1C1C1C] mb-2">Welcome Back</h2>
                    <p className="text-[#5A5751] text-sm font-sans tracking-wide">
                        Please sign in to continue to your account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Mobile Number or Email"
                        name="identifier"
                        type={isPhoneNumber ? "tel" : "text"}
                        inputMode={isPhoneNumber ? "numeric" : "text"}
                        value={formData.identifier}
                        onChange={handleInputChange}
                        placeholder="e.g. 9876543210 or mail@example.com"
                        required
                    />

                    <div className="relative">
                        <Input
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Your password"
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

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => router.push('/forgot-password')}
                            className="text-xs text-[#999] font-medium hover:text-[#C9A14A] transition-colors"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <div className="pt-2">
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
                                    Signing in...
                                </span>
                            ) : (
                                "Login"
                            )}
                        </motion.button>
                    </div>
                </form>

                {/* --- Social Login --- */}
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
                            onClick={handleGoogleLogin}
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
                        onClick={() => router.push('/signup')}
                        className="text-sm text-[#777] font-medium transition-colors"
                    >
                        Don’t have an account? <span className="text-[#C9A14A]">Sign up</span>
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
