import React, { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Bell, Star, ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';

export default function ReadyMadeComingSoon() {
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setIsSubscribed(true);
            setTimeout(() => {
                alert("You have been added to the exclusive waitlist.");
                setEmail('');
                setIsSubscribed(false);
            }, 500);
        }
    };

    return (
        <>
            <Head>
                <title>Coming Soon | Amma Ready-To-Wear</title>
                <meta name="description" content="Our exclusive ready-to-wear collection is launching soon." />
            </Head>

            <main className="min-h-screen bg-[#F9F7F3] flex flex-col items-center justify-center font-sans text-[#1C1C1C] relative overflow-hidden pt-20">
                {/* Abstract Bloom Background */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C9A14A]/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C9A14A]/5 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-xl mx-auto px-6 text-center relative z-10"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8E6E0] shadow-sm mb-8">
                        <Star size={12} className="text-[#C9A14A] fill-[#C9A14A]" />
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#999]">Launching Soon</span>
                    </div>

                    {/* Title */}
                    <h1 className="font-serif text-5xl md:text-7xl mb-6 text-[#1C1C1C] leading-tight">
                        The <span className="italic text-[#C9A14A]">Ready</span><br />Collection
                    </h1>

                    <p className="text-[#555] font-light text-lg mb-10 leading-relaxed">
                        An exclusive curation of pre-stitched masterpieces, ready to adorn your grace.
                        Handcrafted embroidery meets instant elegance.
                    </p>

                    {/* Email Form */}
                    <div className="max-w-sm mx-auto">
                        <form onSubmit={handleSubscribe} className="relative group">
                            <input
                                type="email"
                                placeholder="Enter your email for early access"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full h-14 pl-6 pr-14 rounded-full bg-white border border-[#E8E6E0] focus:border-[#C9A14A] focus:ring-1 focus:ring-[#C9A14A] outline-none transition-all shadow-[0_5px_20px_rgba(0,0,0,0.03)] group-hover:shadow-lg placeholder:font-light placeholder:text-gray-400"
                            />
                            <button
                                type="submit"
                                aria-label="Subscribe"
                                className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-[#1C1C1C] text-white flex items-center justify-center hover:bg-[#C9A14A] transition-colors shadow-md"
                            >
                                <ArrowRight size={18} />
                            </button>
                        </form>
                        <p className="text-[10px] text-[#999] mt-4 tracking-wide uppercase">
                            <Bell size={10} className="inline mr-1 mb-0.5" />
                            Join 2,000+ others on the waitlist
                        </p>
                    </div>

                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-10 hidden lg:block opacity-20">
                    <div className="w-[1px] h-32 bg-[#C9A14A] mx-auto mb-4" />
                    <span className="writing-vertical text-xs tracking-[0.3em] uppercase text-[#C9A14A]">Est. 2024</span>
                </div>

            </main>
            <Footer />
        </>
    );
}
