import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, ShoppingBag, User, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
    const { user, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [bagCount, setBagCount] = useState(0);
    const router = useRouter();
    const isHomePage = router.pathname === '/';

    // Listen for Firestore updates
    useEffect(() => {
        if (!user) {
            setBagCount(0);
            return;
        }

        const draftsRef = collection(db, 'users', user.id, 'drafts');
        const q = query(draftsRef, where('status', '==', 'draft'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setBagCount(snapshot.size);
        });

        return () => unsubscribe();
    }, [user]);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const navLinks = [
        { href: '/designs', label: 'Designs' },
        { href: '/contact', label: 'Custom Embroidery' },
        { href: '/ready-made', label: 'Ready-Made' },
        { href: '/about', label: 'Our Story' },
        { href: '/contact', label: 'Contact' },
    ];

    return (
        <>
            <nav
                className={cn(
                    'fixed top-0 left-0 right-0 z-[70] transition-all duration-300',
                    scrolled ? 'bg-white/10 backdrop-blur-lg shadow-sm border-b border-white/10 py-3' : 'bg-transparent py-5'
                )}
            >
                <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="relative z-50 group">
                        <span className={cn(
                            "font-serif text-2xl font-bold tracking-wide transition-colors duration-300",
                            isOpen ? "text-primary" : "text-primary"
                        )}>
                            AMMA
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.slice(0, 3).map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-sm font-bold text-[#C9A14A] transition-colors uppercase tracking-[0.1em]",
                                    (isHomePage && !scrolled) ? "hover:text-white" : "hover:text-[#1C1C1C]"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Icons */}
                    <div className="flex items-center space-x-4 md:space-x-6 relative z-50">
                        {isAuthenticated && (
                            <Link href="/saved-designs" className={cn(
                                "text-[#C9A14A] transition-colors hidden md:block",
                                (isHomePage && !scrolled) ? "hover:text-white" : "hover:text-[#1C1C1C]"
                            )} title="Saved Designs">
                                <Heart size={20} strokeWidth={1.5} />
                            </Link>
                        )}
                        <Link
                            href={isAuthenticated ? "/profile" : "/login"}
                            className={cn(
                                "text-[#C9A14A] transition-colors hidden md:block",
                                (isHomePage && !scrolled) ? "hover:text-white" : "hover:text-[#1C1C1C]"
                            )}
                            title={isAuthenticated ? "My Account" : "Login"}
                        >
                            <User size={20} strokeWidth={1.5} />
                        </Link>
                        <Link href="/shopping-bag" className={cn(
                            "text-[#C9A14A] transition-colors relative group",
                            (isHomePage && !scrolled) ? "hover:text-white" : "hover:text-[#1C1C1C]"
                        )}>
                            <ShoppingBag size={20} strokeWidth={1.5} />
                            <AnimatePresence>
                                {bagCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[9px] text-primary font-bold shadow-sm"
                                    >
                                        {bagCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden text-primary focus:outline-none p-1"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: "-100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "-100%" }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-[60] bg-background-light pt-24 px-6 md:hidden flex flex-col overflow-y-auto"
                    >
                        <div className="flex flex-col space-y-6 mt-4">
                            {navLinks.map((link, idx) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + idx * 0.05, duration: 0.3 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="block text-3xl font-serif font-medium text-text-main hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="pt-8 border-t border-gray-200 mt-8 space-y-4"
                            >
                                <Link
                                    href={isAuthenticated ? "/profile" : "/login"}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center space-x-3 text-lg font-medium text-text-main/70"
                                >
                                    <User size={20} />
                                    <span>{isAuthenticated ? "My Account" : "Login"}</span>
                                </Link>
                                {isAuthenticated && (
                                    <Link href="/saved-designs" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 text-lg font-medium text-text-main/70">
                                        <Heart size={20} />
                                        <span>Saved Designs</span>
                                    </Link>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
