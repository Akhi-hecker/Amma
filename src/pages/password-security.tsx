import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ChevronRight, ChevronLeft, Lock, Shield, Smartphone } from 'lucide-react';

const SecurityItem = ({
    icon: Icon,
    label,
    value,
    onClick
}: {
    icon: any,
    label: string,
    value?: string,
    onClick: () => void
}) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 bg-white border-b border-[#E8E6E0] last:border-0 hover:bg-[#F9F7F3] transition-colors"
    >
        <div className="flex items-center gap-4">
            <div className="text-[#1C1C1C]/40">
                <Icon size={20} strokeWidth={1.5} />
            </div>
            <div className="text-left">
                <h3 className="text-[#1C1C1C] font-medium text-sm tracking-wide">{label}</h3>
                {value && <p className="text-[#999] text-[10px] uppercase tracking-[0.1em] mt-1">{value}</p>}
            </div>
        </div>
        <ChevronRight size={18} strokeWidth={1.5} className="text-[#CCC]" />
    </button>
);

export default function PasswordSecurityPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#F9F7F3] pb-20 pt-[64px] md:pt-[68px] lg:pt-[72px] font-sans">
            <Head>
                <title>Password & Security | Amma Embroidery</title>
            </Head>

            {/* Header */}
            <header className="bg-[#F9F7F3] h-[90px] flex items-center px-4 pt-6 sticky top-0 z-10">

                <div className="flex-1 text-center">
                    <h1 className="text-3xl font-serif font-light text-[#1C1C1C] tracking-wide relative top-1">Password & Security</h1>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-8 space-y-10">

                <section>
                    <h2 className="text-[10px] uppercase font-medium tracking-[0.2em] text-[#999] mb-4 pl-1">Login & Recovery</h2>
                    <div className="bg-white rounded-none shadow-none border border-[#E8E6E0] overflow-hidden">
                        <SecurityItem
                            icon={Lock}
                            label="Change Password"
                            value="Last changed recently"
                            onClick={() => router.push('/update-password')}
                        />
                        <SecurityItem
                            icon={Shield}
                            label="Two-Factor Authentication"
                            value="Off"
                            onClick={() => alert("Coming soon!")}
                        />
                    </div>
                </section>

                <section>
                    <h2 className="text-[10px] uppercase font-medium tracking-[0.2em] text-[#999] mb-4 pl-1">Where You're Logged In</h2>
                    <div className="bg-white rounded-none shadow-none border border-[#E8E6E0] overflow-hidden p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-none bg-[#F9F7F3] text-[#1C1C1C] flex items-center justify-center border border-[#E8E6E0]">
                                <Smartphone size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-[#1C1C1C] font-medium text-sm tracking-wide">Apple iPhone 15 Pro</h3>
                                <p className="text-[#999] text-[10px] uppercase tracking-[0.1em] mt-1.5">Hyderabad, India • Active now</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="text-center pt-8">
                    <p className="text-[10px] text-[#999] uppercase tracking-[0.1em] max-w-xs mx-auto leading-relaxed">
                        If you see a device you don't recognize, change your password immediately.
                    </p>
                </div>

            </main>
        </div>
    );
}
