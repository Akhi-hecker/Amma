import React from 'react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="w-full bg-[#111111] text-white font-sans pt-24 pb-12 border-t border-white/5">
            <div className="container mx-auto px-6 md:px-12 max-w-7xl">
                {/* Top Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-24">
                    <div className="max-w-md">
                        <h3 className="font-serif text-4xl lg:text-5xl font-light tracking-[0.15em] uppercase text-white mb-6">AMMA</h3>
                        <p className="text-white/40 text-sm font-light leading-relaxed max-w-xs">
                            Elevating embroidery to an art form. Timeless pieces crafted with precision and passion.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-24 w-full lg:w-auto">
                        <div className="flex flex-col gap-5">
                            <FooterLink href="/designs">Designs</FooterLink>
                            <FooterLink href="/ready-made">Ready-to-Wear</FooterLink>
                            <FooterLink href="/about">Maison</FooterLink>
                        </div>
                        <div className="flex flex-col gap-5">
                            <FooterLink href="/contact">Bespoke</FooterLink>
                            <FooterLink href="/returns">Returns</FooterLink>
                            <FooterLink href="/faq">Client Care</FooterLink>
                        </div>
                        <div className="flex flex-col gap-5 col-span-2 md:col-span-1">
                            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#C9A14A] mb-1">Stay Updated</p>
                            <div className="relative w-full max-w-[240px]">
                                <input
                                    type="email"
                                    placeholder="Newsletter..."
                                    className="w-full bg-transparent border-b border-white/20 pb-2 text-sm text-white focus:outline-none focus:border-[#C9A14A] transition-colors font-light placeholder:text-white/30"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-[1px] bg-white/10 mb-8" />

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] md:text-[11px] uppercase tracking-widest text-white/40">
                    <div className="flex gap-8">
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#C9A14A] transition-colors">Instagram</a>
                        <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-[#C9A14A] transition-colors">Pinterest</a>
                    </div>
                    <p>© {new Date().getFullYear()} AMMA EMBROIDERY.</p>
                    <div className="flex gap-8">
                        <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
};

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <Link href={href} className="text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white hover:translate-x-1 transition-all duration-300 transform-gpu inline-block w-fit">
        {children}
    </Link>
);

export default Footer;
