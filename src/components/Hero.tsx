
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

const Hero = () => {
    return (
        <header className="relative w-full h-[85vh] min-h-[600px] flex flex-col">

            {/* Background Container - Restored 'Black & Rounded' Style */}
            <div className="w-full h-full relative overflow-hidden rounded-b-[2rem] bg-black">

                {/* Overlays */}
                <div className="absolute inset-0 bg-black/20 z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>

                {/* Hero Image - Restored 'Contain & Right' Style */}
                <div
                    className="w-full h-full bg-cover bg-center md:bg-contain md:bg-right md:bg-no-repeat transition-transform duration-700 hover:scale-105 opacity-90 blur-sm md:blur-0"
                    style={{
                        backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB_II0R0ouDV3kttnXSn8RIFyi_4MMrmB_9vv1_1aOqn3t9z-N-Aj6Cs0_Y08CVfwtxPbTd1K1czximD-Hald9yO6MZtVR2J5gbDCH3S2G6VPrD9gXx-IPAhMhHp_ArqSzRAa7CWUcqeJPwaXid_56M5aGHy-U1EZGTnCDa6FeYJIVRNcOA4UgqaUPK0NdadXR8o3-FXd3VMJ-oYAeiQjolZzbExbhPXKXwVS-Y555NOptgxcD3oDSxClvWjg4zb8Rv0wGzAbwlPw')",
                    }}
                />

                {/* Content Container - Kept New Editorial Text */}
                <div className="absolute inset-0 z-20 flex flex-col justify-center">
                    <div className="container mx-auto px-6 md:px-12">
                        <div className="max-w-3xl">

                            {/* Eyebrow Label */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="flex items-center gap-3 mb-6"
                            >
                                <span className="h-[1px] w-12 bg-[#C9A14A]"></span>
                                <span className="text-[#C9A14A] text-xs md:text-sm font-bold tracking-[0.2em] uppercase">
                                    Amma Embroidery
                                </span>
                            </motion.div>

                            {/* Main Headline */}
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="text-white font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.1] mb-6 drop-shadow-xl"
                            >
                                The Art of <br />
                                <span className="italic text-[#C9A14A] font-light">Custom Design</span>
                            </motion.h1>

                            {/* Subheadline/Description */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                                className="text-gray-200 text-lg md:text-xl font-light leading-relaxed max-w-xl mb-10"
                            >
                                Select a unique design. Choose your perfect fabric. <br className="hidden md:block" />
                                We craft your personalized masterpiece with precision.
                            </motion.p>

                            {/* CTAs */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                                className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
                            >
                                <Link
                                    href="/designs"
                                    className="bg-white text-[#1C1C1C] px-6 py-3 md:px-8 md:py-4 rounded-none font-semibold text-sm tracking-widest uppercase hover:bg-[#C9A14A] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 w-auto md:min-w-[200px]"
                                >
                                    Explore Designs
                                    <ArrowRight size={16} />
                                </Link>

                                <Link
                                    href="/contact"
                                    className="px-6 py-3 md:px-8 md:py-4 border border-white/30 text-white backdrop-blur-sm hover:bg-white/10 font-medium text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 w-auto md:min-w-[200px]"
                                >
                                    <Play size={14} fill="currentColor" />
                                    Custom Embroidery
                                </Link>
                            </motion.div>

                        </div>
                    </div>
                </div>



            </div>

        </header>
    );
};

export default Hero;
