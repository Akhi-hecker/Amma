import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    User,
    Smartphone,
    Mail,
    Package,
    Heart,
    MapPin,
    HelpCircle,
    Bell,
    Shield,
    LogOut,
    Edit2,
    Lock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const DUMMY_USER = {
    name: "Akhil Kalla",
    phone: "+91 98765 43210",
    email: "akhil.kalla@example.com",
    initials: "AK",
    avatar_url: null
};

const QuickLinkItem = ({
    icon: Icon,
    label,
    onClick,
    isLast = false
}: {
    icon: React.ElementType,
    label: string,
    onClick: () => void,
    isLast?: boolean
}) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between py-5 px-6 hover:bg-[#F9F7F3] transition-colors bg-white group ${!isLast ? 'border-b border-[#E8E6E0]' : ''}`}
        >
            <div className="flex items-center gap-4">
                <Icon size={18} strokeWidth={1.5} className="text-[#1C1C1C] opacity-60 group-hover:opacity-100 transition-opacity" />
                <span className="text-[#1C1C1C] font-medium text-[11px] tracking-[0.15em] uppercase">{label}</span>
            </div>
            <ChevronRight size={16} className="text-[#1C1C1C] opacity-20 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
        </button>
    );
};

const SettingItem = ({
    icon: Icon,
    label,
    onClick,
    isLast = false,
    isDestructive = false
}: {
    icon: React.ElementType,
    label: string,
    onClick: () => void,
    isLast?: boolean,
    isDestructive?: boolean
}) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between py-5 px-6 hover:bg-[#F9F7F3] transition-colors bg-white group ${!isLast ? 'border-b border-[#E8E6E0]' : ''}`}
        >
            <div className="flex items-center gap-4">
                <Icon size={18} strokeWidth={1.5} className={isDestructive ? "text-red-500/60 group-hover:text-red-500 transition-colors" : "text-[#1C1C1C] opacity-60 group-hover:opacity-100 transition-opacity"} />
                <span className={`font-medium text-[11px] tracking-[0.15em] uppercase ${isDestructive ? "text-red-500" : "text-[#1C1C1C]"}`}>{label}</span>
            </div>
            {!isDestructive && <ChevronRight size={16} className="text-[#1C1C1C] opacity-20 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />}
        </button>
    );
};

export default function Profile() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !isAuthenticated) return null;

    const displayUser = user || {
        name: "Guest User",
        phone: "",
        email: "",
        initials: "GU",
        avatar_url: null
    };

    return (
        <>
            <Head>
                <title>My Account | Amma Embroidery</title>
                <meta name="description" content="Manage your orders, saved designs, and account details." />
            </Head>

            {/* Page Header */}
            <div className="min-h-screen bg-[#F9F7F3] pt-[84px] md:pt-[96px] pb-12 font-sans">
                <div className="max-w-md mx-auto px-4 space-y-8">
                    <div className="text-center mb-10">
                        <h1 className="font-serif text-4xl font-light text-[#1C1C1C] mb-4 tracking-wide">My Account</h1>
                        <p className="text-[#5A5751] text-[10px] uppercase tracking-[0.2em] font-medium">Manage your profile</p>
                    </div>

                    {/* Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-none border border-[#E8E6E0] overflow-hidden"
                    >
                        <div className="p-8">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-20 h-20 rounded-none bg-[#1C1C1C] text-white flex items-center justify-center font-serif text-3xl overflow-hidden self-start">
                                    {displayUser.avatar_url ? (
                                        <img
                                            src={displayUser.avatar_url}
                                            alt={displayUser.name || 'User'}
                                            className="w-full h-full object-cover scale-105"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        displayUser.name ? displayUser.name[0] : 'U'
                                    )}
                                </div>
                                <button
                                    onClick={() => router.push('/edit-profile')}
                                    className="text-[#999] hover:text-[#1C1C1C] text-[10px] font-medium uppercase tracking-[0.2em] transition-colors flex items-center gap-2 group border border-transparent hover:border-[#1C1C1C]/20 px-3 py-1.5"
                                >
                                    Edit
                                    <Edit2 size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>

                            <h2 className="font-serif text-3xl text-[#1C1C1C] mb-4 tracking-wide">{displayUser.name}</h2>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-[#999] text-[11px] uppercase tracking-widest font-medium">
                                    <Smartphone size={14} className="text-[#1C1C1C]/40" />
                                    <span className="text-[#1C1C1C]/80">{displayUser.phone || 'No phone'}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[#999] text-[11px] uppercase tracking-widest font-medium">
                                    <Mail size={14} className="text-[#1C1C1C]/40" />
                                    <span className="text-[#1C1C1C]/80 lowercase">{displayUser.email || 'No email'}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-12"
                    >
                        <h3 className="text-[10px] font-semibold text-[#999] uppercase tracking-[0.3em] mb-4 pl-1">My Activity</h3>
                        <div className="rounded-none border-t border-l border-r border-[#E8E6E0] overflow-hidden">
                            <QuickLinkItem
                                icon={Package}
                                label="My Orders"
                                onClick={() => router.push('/my-orders')}
                            />
                            <QuickLinkItem
                                icon={Heart}
                                label="Saved Designs"
                                onClick={() => router.push('/saved-designs')}
                            />
                            <QuickLinkItem
                                icon={MapPin}
                                label="Addresses"
                                onClick={() => router.push('/saved-addresses')}
                            />
                            <QuickLinkItem
                                icon={HelpCircle}
                                label="Help & Support"
                                onClick={() => router.push('/help-support')}
                                isLast
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8"
                    >
                        <h3 className="text-[10px] font-semibold text-[#999] uppercase tracking-[0.3em] mb-4 pl-1">Account Settings</h3>
                        <div className="rounded-none border-t border-l border-r border-[#E8E6E0] overflow-hidden">
                            <SettingItem
                                icon={Bell}
                                label="Notifications"
                                onClick={() => router.push('/notifications')}
                            />
                            <SettingItem
                                icon={Shield}
                                label="Privacy & Policies"
                                onClick={() => router.push('/privacy-policy')}
                            />
                            <SettingItem
                                icon={Lock}
                                label="Password & Security"
                                onClick={() => router.push('/password-security')}
                            />
                            <SettingItem
                                icon={LogOut}
                                label="Log Out"
                                onClick={logout}
                                isLast
                                isDestructive
                            />
                        </div>
                    </motion.div>

                    {/* App Version Info (Optional footer filler) */}
                    <div className="text-center text-[#999] text-[10px] uppercase tracking-[0.2em] font-medium pt-8">
                        <p>Amma Embroidery App v1.0.0</p>
                    </div>
                </div>
            </div>
        </>
    );
}
