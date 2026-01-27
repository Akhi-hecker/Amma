import React, { useState } from 'react';
import Head from 'next/head';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, Sparkles, Crown, MessageCircle, ArrowRight, Clock } from 'lucide-react';

export default function Contact() {
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        type: 'bridal',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle submit logic here
        alert("Thank you. Our concierge will contact you shortly.");
    };

    return (
        <>
            <Head>
                <title>Bespoke Concierge | Amma Embroidery</title>
                <meta name="description" content="Contact our concierge for custom embroidery, bridal couture, and bespoke orders." />
            </Head>

            <main className="min-h-screen bg-[#F9F7F3] pt-[80px] pb-20 font-sans text-[#1C1C1C]">

                {/* Hero / Header */}
                <section className="container mx-auto px-4 md:px-6 mb-16 pt-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <div className="flex items-center justify-center gap-2 mb-4 text-[#C9A14A]">
                            <Sparkles size={16} />
                            <span className="text-xs font-bold tracking-[0.2em] uppercase">Private Atelier</span>
                            <Sparkles size={16} />
                        </div>
                        <h1 className="font-serif text-5xl md:text-7xl text-[#1C1C1C] mb-6 leading-tight">
                            Custom <span className="italic font-light">Embroidery</span> Concierge
                        </h1>
                        <p className="text-lg text-[#555] font-light leading-relaxed max-w-xl mx-auto">
                            From bridal trousseaus to bespoke heirlooms, our master artisans bring your vision to life.
                            Book a consultation or inquire below.
                        </p>
                    </motion.div>
                </section>

                <div className="container mx-auto px-4 md:px-6 max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">

                        {/* Left Column: Direct Contact & Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="space-y-10"
                        >
                            {/* WhatsApp / Instant Action */}
                            <div className="bg-[#1C1C1C] text-white p-8 rounded-2xl shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />

                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                                        <MessageCircle size={24} className="text-[#C9A14A]" />
                                    </div>
                                    <h3 className="font-serif text-2xl mb-2">Instant Consultation</h3>
                                    <p className="text-white/60 text-sm mb-8 leading-relaxed">
                                        Chat directly with our design lead to discuss your requirements, share references, and get immediate estimates.
                                    </p>
                                    <button className="flex items-center gap-3 text-[#C9A14A] font-medium uppercase tracking-wider text-xs hover:gap-4 transition-all">
                                        <span>Start WhatsApp Chat</span>
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-8 pl-2">
                                <div className="flex items-start gap-5 group">
                                    <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:border-[#C9A14A] transition-colors">
                                        <Mail size={18} className="text-[#1C1C1C]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-[#999] font-bold uppercase tracking-wider mb-1">General Inquiries</p>
                                        <a href="mailto:concierge@amma.com" className="font-serif text-xl text-[#1C1C1C] hover:text-[#C9A14A] transition-colors">
                                            concierge@amma.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5 group">
                                    <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:border-[#C9A14A] transition-colors">
                                        <MapPin size={18} className="text-[#1C1C1C]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-[#999] font-bold uppercase tracking-wider mb-1">The Atelier</p>
                                        <p className="font-serif text-xl text-[#1C1C1C] leading-snug">
                                            Road No. 12, Banjara Hills<br />
                                            Hyderabad, India
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5 group">
                                    <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:border-[#C9A14A] transition-colors">
                                        <Clock size={18} className="text-[#1C1C1C]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-[#999] font-bold uppercase tracking-wider mb-1">Studios Hours</p>
                                        <p className="font-serif text-xl text-[#1C1C1C] leading-snug">
                                            Mon - Sat: 10:00 AM - 7:00 PM<br />
                                            <span className="text-base text-[#777] font-sans">By Appointment Only</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </motion.div>

                        {/* Right Column: Inquiry Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-[#E8E6E0] relative"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Crown size={64} />
                            </div>

                            <h3 className="font-serif text-2xl text-[#1C1C1C] mb-8">Send a Request</h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#999] uppercase tracking-wide ml-1">Your Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#F9F7F3] border-none rounded-xl py-4 px-5 text-[#1C1C1C] focus:ring-1 focus:ring-[#C9A14A] placeholder-gray-400 transition-all font-medium"
                                        placeholder="Jane Doe"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#999] uppercase tracking-wide ml-1">Email or Phone</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#F9F7F3] border-none rounded-xl py-4 px-5 text-[#1C1C1C] focus:ring-1 focus:ring-[#C9A14A] placeholder-gray-400 transition-all font-medium"
                                        placeholder="jane@example.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#999] uppercase tracking-wide ml-1">Interest</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Bridal Couture', 'Custom Design', 'Bulk Order', 'Other'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormState({ ...formState, type })}
                                                className={`py-3 rounded-lg text-sm font-medium transition-all ${formState.type === type ? 'bg-[#1C1C1C] text-white' : 'bg-[#F9F7F3] text-[#555] hover:bg-gray-200'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#999] uppercase tracking-wide ml-1">Your Vision</label>
                                    <textarea
                                        rows={4}
                                        className="w-full bg-[#F9F7F3] border-none rounded-xl py-4 px-5 text-[#1C1C1C] focus:ring-1 focus:ring-[#C9A14A] placeholder-gray-400 transition-all resize-none font-medium"
                                        placeholder="Tell us about the fabric, occasion, or design ideas..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#C9A14A] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#B89240] transition-colors shadow-lg shadow-[#C9A14A]/20 flex items-center justify-center gap-2"
                                >
                                    <span>Submit Request</span>
                                    <Send size={14} />
                                </button>
                            </form>
                        </motion.div>

                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
