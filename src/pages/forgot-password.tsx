import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowLeft, Mail, ChevronRight } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await sendPasswordResetEmail(auth, email, {
                url: `${window.location.origin}/login`, // Redirect to login after reset (Firebase handles the reset page usually, or we can build a custom handler)
                // Note: Firebase sends a link to a handler. If we want a custom handler in app, we need to handle the action URL.
                // Standard Firebase behavior is a hosted action page, or deep link.
                // For web, it usually goes to a firebase-hosted page unless we customize handleCodeInApp.
                // Let's assume standard behavior for now.
            });

            setIsSuccess(true);
            setIsSubmitting(false);

        } catch (err: any) {
            console.error("Reset request failed", err);
            let msg = "An error occurred. Please try again.";
            if (err.code === 'auth/user-not-found') msg = "User not found.";
            if (err.code === 'auth/invalid-email') msg = "Invalid email address.";
            alert(msg);
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] flex flex-col items-center justify-center p-6">
                <Head>
                    <title>Check Your Email | Amma Embroidery</title>
                </Head>

                <div className="w-16 h-16 bg-[#C9A14A]/10 rounded-full flex items-center justify-center text-[#C9A14A] mb-6">
                    <Mail size={32} />
                </div>

                <h2 className="text-2xl font-serif text-[#1C1C1C] mb-2 text-center">Check your email</h2>
                <p className="text-[#5A5751] text-sm text-center max-w-xs mb-8">
                    We've sent a password reset link to <span className="font-medium text-[#1C1C1C]">{email}</span>.
                </p>

                <button
                    onClick={() => router.push('/login')}
                    className="w-full max-w-xs py-4 rounded-xl bg-[#C9A14A] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#C9A14A]/20 transition-transform active:scale-95"
                >
                    Back to Login
                </button>

                <button
                    onClick={() => { setIsSuccess(false); setIsSubmitting(false); }}
                    className="mt-6 text-xs text-[#999] hover:text-[#C9A14A] transition-colors"
                >
                    Didn't receive it? Try again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-20 pt-[64px] md:pt-[68px] lg:pt-[72px]">
            <Head>
                <title>Forgot Password | Amma Embroidery</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            </Head>

            {/* --- Top Bar --- */}
            <header className="w-full bg-[#F9F7F3] h-[72px] flex items-center px-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 text-[#1C1C1C] active:opacity-70"
                >
                    <ArrowLeft size={24} strokeWidth={1.5} />
                </button>
                <h1 className="flex-1 text-center text-xl font-serif text-[#1C1C1C] pr-10">
                    Reset Password
                </h1>
            </header>

            <main className="max-w-md mx-auto px-6 py-4">
                <div className="mb-10 mt-4">
                    <h2 className="text-2xl font-serif text-[#1C1C1C] mb-2">Forgot Password?</h2>
                    <p className="text-[#5A5751] text-sm font-sans tracking-wide leading-relaxed">
                        Enter the email associated with your account and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. mail@example.com"
                        required
                    />

                    <div className="pt-2">
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            disabled={!email || isSubmitting}
                            type="submit"
                            className={`
                                w-full py-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all
                                ${email && !isSubmitting
                                    ? 'bg-[#1C1C1C] text-white shadow-lg shadow-[#1C1C1C]/20'
                                    : 'bg-[#E8E6E0] text-[#999] cursor-not-allowed'}
                            `}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                                    Sending Link...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Send Reset Link
                                    <ChevronRight size={16} />
                                </span>
                            )}
                        </motion.button>
                    </div>
                </form>
            </main>
        </div>
    );
}

// --- Reused Input Component ---
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
