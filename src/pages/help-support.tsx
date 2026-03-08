import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ChevronLeft, MessageCircle, Mail, Phone } from 'lucide-react';
import FAQ from '@/components/FAQ'; // reusing existing FAQ component

export default function HelpSupportPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#F9F7F3] pb-20 pt-[64px] md:pt-[68px] lg:pt-[72px] font-sans">
            <Head>
                <title>Help & Support | Amma Embroidery</title>
            </Head>

            {/* Header */}
            <div className="bg-white px-4 py-4 pt-10 sticky top-0 z-10 border-b border-[#E8E6E0] shadow-none flex items-center justify-between">

                <h1 className="font-serif text-xl text-[#1C1C1C] absolute left-1/2 -translate-x-1/2">Help & Support</h1>
                <div className="w-10" />
            </div>

            <main className="max-w-md mx-auto px-4 py-6 space-y-8">

                {/* Contact Options */}
                <section>
                    <h2 className="text-[10px] font-bold text-[#1C1C1C] uppercase tracking-[0.1em] mb-4 pl-1">Contact Us</h2>
                    <div className="bg-white rounded-none shadow-none border border-[#E8E6E0] overflow-hidden">
                        <button
                            onClick={() => router.push('/contact')}
                            className="w-full flex items-center gap-4 p-4 border-b border-[#E8E6E0] hover:bg-[#F9F7F3] transition-colors text-left group"
                        >
                            <div className="w-10 h-10 rounded-none bg-[#F9F7F3] border border-[#E8E6E0] text-[#1C1C1C] group-hover:border-[#1C1C1C]/40 transition-colors flex items-center justify-center">
                                <MessageCircle size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-[#1C1C1C] font-serif text-base">Chat with Us</h3>
                                <p className="text-[#777] text-xs mt-0.5">Start a conversation now</p>
                            </div>
                        </button>

                        <a
                            href="mailto:support@ammadetails.com"
                            className="w-full flex items-center gap-4 p-4 border-b border-[#E8E6E0] hover:bg-[#F9F7F3] transition-colors text-left group"
                        >
                            <div className="w-10 h-10 rounded-none bg-[#F9F7F3] border border-[#E8E6E0] text-[#1C1C1C] group-hover:border-[#1C1C1C]/40 transition-colors flex items-center justify-center">
                                <Mail size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-[#1C1C1C] font-serif text-base">Send an Email</h3>
                                <p className="text-[#777] text-xs mt-0.5">We typically reply in 24h</p>
                            </div>
                        </a>

                        <a
                            href="tel:+919876543210"
                            className="w-full flex items-center gap-4 p-4 hover:bg-[#F9F7F3] transition-colors text-left group"
                        >
                            <div className="w-10 h-10 rounded-none bg-[#F9F7F3] border border-[#E8E6E0] text-[#1C1C1C] group-hover:border-[#1C1C1C]/40 transition-colors flex items-center justify-center">
                                <Phone size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-[#1C1C1C] font-serif text-base">Call Us</h3>
                                <p className="text-[#777] text-xs mt-0.5">Mon-Sat, 9AM - 6PM</p>
                            </div>
                        </a>
                    </div>
                </section>

                {/* FAQs */}
                <section>
                    <h2 className="text-[10px] font-bold text-[#1C1C1C] uppercase tracking-[0.1em] mb-4 pl-1">Frequently Asked Questions</h2>
                    <FAQ />
                </section>

            </main>
        </div>
    );
}
