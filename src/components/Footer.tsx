import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Twitter, Send } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full bg-background-light text-text-main font-sans pt-16 pb-8 border-t border-divider">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="container mx-auto px-6 md:px-12 lg:px-24"
            >
                {/* Headline */}
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight">
                        Designed with Passion. <br className="hidden md:block" />
                        <span className="text-primary italic font-serif">Embroidered with Precision.</span>
                    </h2>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

                    {/* Brand Story */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-serif font-semibold">About Amma</h3>
                        <p className="text-text-muted text-sm leading-relaxed max-w-xs pl-4 md:pl-0">
                            We bring your fashion dreams to life with intricate, high-quality computer embroidery.
                            Reviewing every stitch to ensure perfection and elegance in every piece.
                        </p>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-serif font-semibold">Contact Us</h3>
                        <div className="flex flex-col gap-3 text-text-muted text-sm pl-4 md:pl-0">
                            <a href="mailto:hello@ammaembroidery.com" className="hover:text-primary transition-colors h-[48px] flex items-center md:h-auto">
                                hello@ammaembroidery.com
                            </a>
                            <a href="tel:+1234567890" className="hover:text-primary transition-colors h-[48px] flex items-center md:h-auto">
                                +91 98765 43210
                            </a>
                            <address className="not-italic">
                                123 Fashion Avenue,<br />
                                Creative District, India
                            </address>
                        </div>
                    </div>

                    {/* Policy Links */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-serif font-semibold">Policies</h3>
                        <ul className="flex flex-col gap-2 pl-4 md:pl-0">
                            <li>
                                <a href="/privacy-policy" className="text-text-muted text-sm hover:text-primary transition-colors h-[48px] flex items-center md:h-auto">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="/returns" className="text-text-muted text-sm hover:text-primary transition-colors h-[48px] flex items-center md:h-auto">
                                    Returns & Exchanges
                                </a>
                            </li>
                            <li>
                                <a href="/terms" className="text-text-muted text-sm hover:text-primary transition-colors h-[48px] flex items-center md:h-auto">
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="flex flex-col gap-6">
                        <h3 className="text-lg font-serif font-semibold">Stay Inspired</h3>
                        <div className="pl-4 md:pl-0">
                            <p className="text-text-muted text-sm mb-3">
                                Subscribe to get updates on new designs and exclusive offers.
                            </p>
                            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full px-4 h-[48px] rounded-lg border border-text-main/10 bg-white focus:outline-none focus:border-primary transition-colors text-sm"
                                />
                                <button
                                    type="submit"
                                    className="w-full h-[48px] bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    Subscribe
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    </div>

                </div>

                {/* Footer Bottom / Socials */}
                <div className="flex flex-col md:flex-row items-center justify-between border-t border-text-main/5 pt-8 gap-6">

                    <div className="flex items-center gap-6 order-2 md:order-1">
                        <a href="#" aria-label="Instagram" className="text-text-main/60 hover:text-primary transition-colors p-2 -ml-2">
                            <Instagram size={24} strokeWidth={1.5} />
                        </a>
                        <a href="#" aria-label="Facebook" className="text-text-main/60 hover:text-primary transition-colors p-2">
                            <Facebook size={24} strokeWidth={1.5} />
                        </a>
                        <a href="#" aria-label="Twitter" className="text-text-main/60 hover:text-primary transition-colors p-2">
                            <Twitter size={24} strokeWidth={1.5} />
                        </a>
                    </div>

                    <p className="text-xs text-text-muted text-center md:text-right order-1 md:order-2">
                        © {new Date().getFullYear()} Amma Embroidery. All rights reserved.
                    </p>
                </div>

            </motion.div>
        </footer>
    );
};

export default Footer;
