import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#F9F7F3] pb-20 pt-[64px] md:pt-[68px] lg:pt-[72px] font-sans">
            <Head>
                <title>Privacy Policy | Amma Embroidery</title>
            </Head>

            {/* Header */}
            <header className="bg-[#F9F7F3] h-[90px] flex items-center px-4 pt-6 sticky top-0 z-10">

                <div className="flex-1 text-center">
                    <h1 className="text-3xl font-serif font-light text-[#1C1C1C] tracking-wide relative top-1">Privacy Policy</h1>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-8 space-y-8 text-[#5A5751] text-sm leading-relaxed">

                <div className="bg-white p-8 rounded-none shadow-none border border-[#E8E6E0]">
                    <h2 className="text-[#1C1C1C] font-serif text-xl font-light tracking-wide mb-4">1. Information We Collect</h2>
                    <p className="mb-8 text-[11px] leading-relaxed uppercase tracking-[0.1em] font-medium text-[#999]">
                        We collect information you provide directly to us, such as when you create an account, update your profile, place an order, or communicate with us. This includes your name, email, phone number, and shipping address.
                    </p>

                    <h2 className="text-[#1C1C1C] font-serif text-xl font-light tracking-wide mb-4">2. How We Use Information</h2>
                    <p className="mb-8 text-[11px] leading-relaxed uppercase tracking-[0.1em] font-medium text-[#999]">
                        We use the information we collect to operate, maintain, and provide the features and functionality of the Service. We also use the information to communicate with you about your account and order updates.
                    </p>

                    <h2 className="text-[#1C1C1C] font-serif text-xl font-light tracking-wide mb-4">3. Sharing of Information</h2>
                    <p className="mb-8 text-[11px] leading-relaxed uppercase tracking-[0.1em] font-medium text-[#999]">
                        We do not share your personal information with third parties without your consent, except as described in this Policy or if required by law.
                    </p>

                    <h2 className="text-[#1C1C1C] font-serif text-xl font-light tracking-wide mb-4">4. Security</h2>
                    <p className="text-[11px] leading-relaxed uppercase tracking-[0.1em] font-medium text-[#999]">
                        We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                    </p>
                </div>

                <p className="text-center text-[10px] uppercase font-medium tracking-[0.2em] text-[#999] pt-6">
                    Last updated: January 2026
                </p>

            </main>
        </div>
    );
}
