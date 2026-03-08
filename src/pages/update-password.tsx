import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Eye, EyeOff, Lock, ChevronRight } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { confirmPasswordReset, updatePassword, verifyPasswordResetCode } from 'firebase/auth';

// ...

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6 || password !== confirmPassword || isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Check for oobCode (Password Reset flow)
            const { oobCode } = router.query;

            if (oobCode && typeof oobCode === 'string') {
                await confirmPasswordReset(auth, oobCode, password);
                alert("Password has been reset successfully! You can now login.");
                router.push('/login');
            } else if (auth.currentUser) {
                // Authenticated User flow (Change Password)
                await updatePassword(auth.currentUser, password);
                alert("Password updated successfully!");
                router.push('/');
            } else {
                throw new Error("No authentication session or reset code found.");
            }

        } catch (err: any) {
            console.error("Password update failed", err);
            let msg = "An error occurred. Please try again.";
            if (err.code === 'auth/expired-action-code') msg = 'The reset link has expired.';
            if (err.code === 'auth/invalid-action-code') msg = 'The reset link is invalid.';
            if (err.code === 'auth/weak-password') msg = 'Password is too weak.';
            if (err.code === 'auth/requires-recent-login') msg = 'Please log in again to update your password.';

            alert(msg);
        } finally {
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
            <header className="w-full bg-[#F9F7F3] h-[90px] flex items-center px-4 pt-6 sticky top-0 z-10 justify-center">
                <h1 className="text-3xl font-serif font-light text-[#1C1C1C] tracking-wide relative top-1">
                    Set New Password
                </h1>
            </header>

            <main className="max-w-md mx-auto px-6 py-8">
                <div className="mb-12 mt-4 text-center">
                    <p className="text-[#5A5751] text-[10px] uppercase tracking-[0.2em] font-medium leading-relaxed max-w-sm mx-auto">
                        Please enter a new password for your account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
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
                            className="absolute right-0 top-3 text-[#999] p-1.5 hover:text-[#1C1C1C] transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
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
                        <p className="text-red-500 text-[10px] uppercase tracking-[0.1em] font-medium mt-1">Passwords do not match</p>
                    )}

                    <div className="pt-4">
                        <button
                            disabled={!password || password.length < 6 || password !== confirmPassword || isSubmitting}
                            type="submit"
                            className={`
                                w-full py-4 rounded-none font-medium text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-300 border
                                ${password && password === confirmPassword && !isSubmitting
                                    ? 'bg-[#1C1C1C] border-[#1C1C1C] text-white hover:bg-black hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)]'
                                    : 'bg-transparent border-[#E8E6E0] text-[#999] cursor-not-allowed'}
                            `}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-3">
                                    <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                                    Updating...
                                </span>
                            ) : (
                                "Update Password"
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
                    w-full bg-transparent border-0 border-b-2 rounded-none px-0 py-3 pr-10 text-[#1C1C1C] text-sm outline-none transition-all placeholder:text-transparent
                    ${(isFocused || hasValue) ? 'border-[#1C1C1C]' : 'border-[#E8E6E0]'}
                `}
                placeholder={label}
            />
        </div>
    );
}
