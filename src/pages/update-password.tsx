import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Eye, EyeOff, Lock, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Ensure we have a session (hash fragment from email link works automatically with Supabase client to set session)
        // However, we should double check session or hash if needed. 
        // Typically Supabase handles the session exchange from the URL fragment before this component mounts fully or right after.
        // We'll trust the global auth listener state which updates automatically.
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6 || password !== confirmPassword || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: password });

            if (error) {
                alert(error.message);
                setIsSubmitting(false);
            } else {
                alert("Password updated successfully!");
                router.push('/'); // Go to home or profile
            }
        } catch (err) {
            console.error("Password update failed", err);
            alert("An error occurred. Please try again.");
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C] pb-20 pt-[64px] md:pt-[68px] lg:pt-[72px]">
            <Head>
                <title>Set New Password | Amma Embroidery</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            </Head>

            {/* --- Top Bar --- */}
            <header className="w-full bg-[#F9F7F3] h-[72px] flex items-center px-4 justify-center">
                <h1 className="text-xl font-serif text-[#1C1C1C]">
                    Set New Password
                </h1>
            </header>

            <main className="max-w-md mx-auto px-6 py-4">
                <div className="mb-10 mt-4">
                    <p className="text-[#5A5751] text-sm font-sans tracking-wide leading-relaxed text-center">
                        Please enter a new password for your account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Input
                            label="New Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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

                    <Input
                        label="Confirm Password"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required
                    />

                    {password && confirmPassword && password !== confirmPassword && (
                        <p className="text-red-500 text-xs ml-1">Passwords do not match</p>
                    )}

                    <div className="pt-2">
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            disabled={!password || password.length < 6 || password !== confirmPassword || isSubmitting}
                            type="submit"
                            className={`
                                w-full py-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all
                                ${password && password === confirmPassword && !isSubmitting
                                    ? 'bg-[#C9A14A] text-white shadow-lg shadow-[#C9A14A]/20'
                                    : 'bg-[#E8E6E0] text-[#999] cursor-not-allowed'}
                            `}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                                    Updating...
                                </span>
                            ) : (
                                "Update Password"
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
