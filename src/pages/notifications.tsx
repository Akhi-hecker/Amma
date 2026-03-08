import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ChevronLeft, Bell, Tag, Truck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const NotificationToggle = ({
    icon: Icon,
    label,
    description,
    checked,
    onChange
}: {
    icon: any,
    label: string,
    description: string,
    checked: boolean,
    onChange: (checked: boolean) => void
}) => (
    <div className="flex items-center justify-between p-6 bg-white border-b border-[#E8E6E0] last:border-0 hover:bg-[#F9F7F3] transition-colors">
        <div className="flex items-start gap-4">
            <div className="mt-0.5 text-[#1C1C1C]/40">
                <Icon size={20} strokeWidth={1.5} />
            </div>
            <div>
                <h3 className="text-[#1C1C1C] font-medium text-sm tracking-wide">{label}</h3>
                <p className="text-[#999] text-[10px] uppercase tracking-[0.1em] mt-1">{description}</p>
            </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#E8E6E0] peer-focus:outline-none rounded-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E8E6E0] after:border after:rounded-none after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1C1C1C]"></div>
        </label>
    </div>
);

export default function NotificationsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        orders: true,
        promotions: false,
        newArrivals: true
    });

    useEffect(() => {
        const fetchSettings = async () => {
            if (!user) return;
            try {
                const docRef = doc(db, 'users', user.id, 'settings', 'notifications');
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    setSettings(snap.data() as any);
                }
            } catch (err) {
                console.error("Failed to fetch notification settings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [user]);

    const updateSetting = async (key: keyof typeof settings, value: boolean) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings); // Optimistic update

        if (user) {
            try {
                const docRef = doc(db, 'users', user.id, 'settings', 'notifications');
                await setDoc(docRef, newSettings, { merge: true });
            } catch (err) {
                console.error("Failed to save settings", err);
                // Revert if needed, but low critical for now
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F7F3] pb-20 pt-[64px] md:pt-[68px] lg:pt-[72px] font-sans">
            <Head>
                <title>Notifications | Amma Embroidery</title>
            </Head>

            {/* Header */}
            <header className="bg-[#F9F7F3] h-[90px] flex items-center px-4 pt-6 sticky top-0 z-10">

                <div className="flex-1 text-center">
                    <h1 className="text-3xl font-serif font-light text-[#1C1C1C] tracking-wide relative top-1">Notifications</h1>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-8">
                <div className="bg-white rounded-none shadow-none border border-[#E8E6E0] overflow-hidden">
                    <NotificationToggle
                        icon={Truck}
                        label="Order Updates"
                        description="Get alerts about your order status and delivery."
                        checked={settings.orders}
                        onChange={(v) => updateSetting('orders', v)}
                    />
                    <NotificationToggle
                        icon={Tag}
                        label="Promotions & Offers"
                        description="Receive exclusive deals and discount codes."
                        checked={settings.promotions}
                        onChange={(v) => updateSetting('promotions', v)}
                    />
                    <NotificationToggle
                        icon={Bell}
                        label="New Arrivals"
                        description="Be the first to know about new designs."
                        checked={settings.newArrivals}
                        onChange={(v) => updateSetting('newArrivals', v)}
                    />
                </div>
                <p className="text-center text-[10px] uppercase tracking-[0.2em] font-medium text-[#999] mt-8 px-4 leading-relaxed max-w-xs mx-auto">
                    Note: Fundamental transaction emails (like invoices) cannot be disabled.
                </p>
            </main>
        </div>
    );
}
