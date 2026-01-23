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
                        className="fixed bottom-0 left-0 right-0 z-[101] bg-[#F9F7F3] rounded-t-2xl p-6 md:p-8 md:max-w-md md:mx-auto md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-2xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center">
                            {/* Icon */}
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-[#E8E6E0]">
                                <Lock size={20} className="text-[#C9A14A]" />
                            </div>

                            {/* Text */}
                            <h3 className="text-xl font-serif text-[#1C1C1C] mb-2">
                                Please log in to continue
                            </h3>
                            <p className="text-[#555555] text-sm leading-relaxed mb-8 max-w-xs">
                                Create an account to save designs, place orders, and track your history.
                            </p>

                            {/* Actions */}
                            <div className="w-full space-y-3">
                                <button
                                    onClick={onLogin}
                                    className="w-full bg-[#C9A14A] hover:bg-[#b08d40] text-white py-3.5 rounded-xl font-medium transition-colors shadow-lg shadow-[#C9A14A]/20"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={onSignup}
                                    className="w-full bg-white border border-[#E8E6E0] text-[#1C1C1C] py-3.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Create Account
                                </button>
                                <button
                                    onClick={onClose}
                                    className="pt-2 text-xs text-[#999] font-medium hover:text-[#555] transition-colors"
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
