import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: () => void;
    onSignup: () => void;
}

export default function AuthModal({ isOpen, onClose, onLogin, onSignup }: AuthModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-[101] bg-[#F9F7F3] rounded-t-none p-8 md:p-10 md:max-w-md md:mx-auto md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-none shadow-2xl border border-[#1C1C1C]/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center">
                            {/* Icon */}
                            <div className="w-12 h-12 bg-transparent rounded-none flex items-center justify-center mb-6 shadow-none border border-[#1C1C1C]/20">
                                <Lock size={18} className="text-[#1C1C1C]" strokeWidth={1.5} />
                            </div>

                            {/* Text */}
                            <h3 className="text-2xl font-serif font-light text-[#1C1C1C] mb-3 tracking-wide">
                                Authentication Required
                            </h3>
                            <p className="text-[#999] text-[10px] uppercase tracking-[0.2em] font-medium leading-relaxed mb-10 max-w-xs">
                                Create an account to save designs, place orders, and track your history
                            </p>

                            {/* Actions */}
                            <div className="w-full space-y-4">
                                <button
                                    onClick={onLogin}
                                    className="w-full bg-[#1C1C1C] hover:bg-black text-white py-4 rounded-none text-[11px] tracking-[0.2em] uppercase font-medium transition-all duration-300 shadow-none hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)]"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={onSignup}
                                    className="w-full bg-transparent border border-[#1C1C1C]/20 text-[#1C1C1C] py-4 rounded-none text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-white hover:border-[#1C1C1C] transition-all duration-300"
                                >
                                    Create Account
                                </button>
                                <button
                                    onClick={onClose}
                                    className="pt-4 text-[10px] uppercase tracking-[0.1em] text-[#999] font-medium hover:text-[#1C1C1C] transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
