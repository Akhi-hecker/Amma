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

                <div className="w-20 h-20 bg-transparent border border-[#E8E6E0] rounded-none flex items-center justify-center text-[#1C1C1C] opacity-40 mb-8 mx-auto">
                    <Mail size={24} strokeWidth={1.5} />
                </div>

                <h2 className="text-3xl font-serif font-light text-[#1C1C1C] mb-4 tracking-wide text-center">Check your email</h2>
                <p className="text-[#999] text-[10px] uppercase tracking-[0.2em] font-medium leading-relaxed max-w-xs mx-auto text-center mb-10">
                    We've sent a password reset link to <span className="font-bold text-[#1C1C1C]">{email}</span>.
                </p>

                <button
                    onClick={() => router.push('/login')}
                    className="w-full max-w-xs py-4 rounded-none bg-[#1C1C1C] text-white font-medium text-[11px] tracking-[0.2em] uppercase shadow-none hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] hover:bg-black transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                >
                    Back to Login
                </button>

                <button
                    onClick={() => { setIsSuccess(false); setIsSubmitting(false); }}
                    className="mt-8 text-[10px] uppercase tracking-[0.1em] text-[#999] hover:text-[#1C1C1C] transition-colors font-medium text-center block mx-auto"
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
            <header className="w-full bg-[#F9F7F3] h-[90px] flex items-center px-4 pt-6 sticky top-0 z-10">

                <div className="flex-1 text-center">
                    <h1 className="text-3xl font-serif font-light text-[#1C1C1C] tracking-wide relative top-1">
                        Reset Password
                    </h1>
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 py-8">
                <div className="mb-12 mt-4 text-center">
                    <h2 className="text-3xl font-serif font-light text-[#1C1C1C] mb-4 tracking-wide">Forgot Password?</h2>
                    <p className="text-[#5A5751] text-[10px] uppercase tracking-[0.2em] font-medium leading-relaxed max-w-sm mx-auto">
                        Enter the email associated with your account and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. mail@example.com"
                        required
                    />

                    <div className="pt-4">
                        <button
                            disabled={!email || isSubmitting}
                            type="submit"
                            className={`
                                w-full py-4 rounded-none font-medium text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-300 border
                                ${email && !isSubmitting
                                    ? 'bg-[#1C1C1C] border-[#1C1C1C] text-white hover:bg-black hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)]'
                                    : 'bg-transparent border-[#E8E6E0] text-[#999] cursor-not-allowed'}
                            `}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-3">
                                    <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                                    Sending Link...
                                </span>
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>
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
                    absolute left-0 px-0 transition-all duration-300 pointer-events-none z-10 bg-transparent font-medium tracking-[0.2em] uppercase
                    ${(isFocused || hasValue)
                        ? '-top-6 text-[9px] text-[#1C1C1C]'
                        : 'top-3.5 text-[10px] text-[#999]'}
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
                    w-full bg-transparent border-0 border-b-2 rounded-none px-0 py-3 text-[#1C1C1C] text-sm outline-none transition-all placeholder:text-transparent
                    ${(isFocused || hasValue) ? 'border-[#1C1C1C]' : 'border-[#E8E6E0]'}
                `}
                placeholder={label}
            />
        </div>
    );
}
