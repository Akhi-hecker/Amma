import React from 'react';
import { Instagram, Facebook, Twitter, ArrowRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full bg-[#1C1C1C] text-white font-sans pt-20 pb-10 border-t border-white/5">
            <div className="container mx-auto px-6 md:px-12 max-w-7xl">

                <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-6 mb-20 border-b border-white/5 pb-16">
                    {/* Brand & Mission */}
                    <div className="max-w-xs">
                        <h3 className="font-serif text-3xl font-medium tracking-tight text-white mb-6">Amma</h3>
                        <p className="text-white/40 text-sm leading-relaxed mb-6">
                            Elevating embroidery to an art form. We combine traditional craftsmanship with modern technology to create timeless pieces.
                        </p>
                        <div className="flex items-center gap-4">
                            <SocialLink icon={<Instagram size={18} />} href="#" />
                            <SocialLink icon={<Facebook size={18} />} href="#" />
                            <SocialLink icon={<Twitter size={18} />} href="#" />
                        </div>
                    </div>

                    {/* Quick Nav */}
                    <div className="grid grid-cols-2 gap-x-20 gap-y-8">
                        <div className="flex flex-col gap-4">
                            <h4 className="text-xs font-bold text-[#C9A14A] tracking-wider uppercase mb-2">Explore</h4>
                            <FooterLink href="/designs">Browse Designs</FooterLink>
                            <FooterLink href="/how-it-works">How It Works</FooterLink>
                            <FooterLink href="/about">Our Story</FooterLink>
                        </div>
                        <div className="flex flex-col gap-4">
                            <h4 className="text-xs font-bold text-[#C9A14A] tracking-wider uppercase mb-2">Help</h4>
                            <FooterLink href="/contact">Contact Us</FooterLink>
                            <FooterLink href="/returns">Returns</FooterLink>
                            <FooterLink href="/faq">FAQ</FooterLink>
                        </div>
                    </div>

                    {/* Newsletter - Minimal */}
                    <div className="max-w-xs w-full">
                        <h4 className="text-xs font-bold text-[#C9A14A] tracking-wider uppercase mb-6">Stay Updated</h4>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A14A] transition-colors"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#C9A14A] transition-colors p-1">
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/20">
                    <p>© {new Date().getFullYear()} Amma Embroidery. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white/40 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white/40 transition-colors">Terms of Service</a>
                    </div>
                </div>

            </div>
        </footer>
    );
};

// Sub-components for consistency
const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <a href={href} className="text-sm text-white/60 hover:text-white transition-colors hover:translate-x-1 duration-300 inline-block">
        {children}
    </a>
);

const SocialLink = ({ icon, href }: { icon: React.ReactNode, href: string }) => (
    <a href={href} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-[#C9A14A] hover:text-white transition-all duration-300">
        {icon}
    </a>
);

export default Footer;
