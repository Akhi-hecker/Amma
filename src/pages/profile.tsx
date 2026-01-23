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
            className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group ${!isLast ? 'border-b border-[#F0EFEC]' : ''}`}
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F9F7F3] flex items-center justify-center text-[#C9A14A] group-hover:bg-[#F0EFEC] transition-colors">
                    <Icon size={20} strokeWidth={1.5} />
                </div>
                <span className="text-[#1C1C1C] font-medium text-[15px]">{label}</span>
            </div>
            <ChevronRight size={18} className="text-[#999999]" />
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
            className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${!isLast ? 'border-b border-[#F0EFEC]' : ''}`}
        >
            <div className="flex items-center gap-3">
                <Icon size={20} strokeWidth={1.5} className={isDestructive ? "text-red-500" : "text-[#555555]"} />
                <span className={`font-medium text-[15px] ${isDestructive ? "text-red-500" : "text-[#1C1C1C]"}`}>{label}</span>
            </div>
            {!isDestructive && <ChevronRight size={18} className="text-[#999999]" />}
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
                    <div className="text-center mb-6">
                        <h1 className="font-serif text-3xl text-[#1C1C1C] mb-2">My Account</h1>
                        <p className="text-[#555555] text-sm">Manage your profile & preferences</p>
                    </div>

                    {/* Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm border border-[#F0EFEC] overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-16 h-16 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center font-serif text-2xl overflow-hidden">
                                    {displayUser.avatar_url ? (
                                        <img
                                            src={displayUser.avatar_url}
                                            alt={displayUser.name || 'User'}
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        displayUser.name ? displayUser.name[0] : 'U'
                                    )}
                                </div>
                                <button
                                    onClick={() => router.push('/edit-profile')}
                                    className="text-[#C9A14A] text-sm font-medium hover:text-[#B08D40] transition-colors flex items-center gap-1"
                                >
                                    Edit
                                    <Edit2 size={14} />
                                </button>
                            </div>

                            <h2 className="font-serif text-2xl text-[#1C1C1C] mb-2">{displayUser.name}</h2>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[#555555] text-sm">
                                    <Smartphone size={16} />
                                    <span>{displayUser.phone || 'No phone'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[#555555] text-sm">
                                    <Mail size={16} />
                                    <span>{displayUser.email || 'No email'}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Primary Quick Links - My Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="text-xs font-bold text-[#999999] uppercase tracking-widest mb-3 pl-1">My Activity</h3>
                        <div className="bg-white rounded-xl shadow-sm border border-[#F0EFEC] overflow-hidden">
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
                                onClick={() => { }}
                                isLast
                            />
                        </div>
                    </motion.div>

                    {/* Secondary Actions - Account Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="text-xs font-bold text-[#999999] uppercase tracking-widest mb-3 pl-1">Account Settings</h3>
                        <div className="bg-white rounded-xl shadow-sm border border-[#F0EFEC] overflow-hidden">
                            <SettingItem
                                icon={Bell}
                                label="Notifications"
                                onClick={() => { }}
                            />
                            <SettingItem
                                icon={Shield}
                                label="Privacy & Policies"
                                onClick={() => { }}
                            />
                            <SettingItem
                                icon={Lock}
                                label="Password & Security"
                                onClick={() => router.push('/update-password')}
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
                    <div className="text-center text-[#999999] text-xs pt-4">
                        <p>Amma Embroidery App v1.0.0</p>
                    </div>
                </div>
            </div>
        </>
    );
}
