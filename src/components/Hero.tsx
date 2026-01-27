import Link from 'next/link';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <header className="relative w-full flex flex-col">
            {/* Background Image Container */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full aspect-[4/5] md:aspect-[16/9] lg:aspect-[21/9] relative overflow-hidden rounded-b-[2rem] bg-black"
            >
                <div className="absolute inset-0 bg-black/20 z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                {/* Hero Image */}
                <div
                    className="w-full h-full bg-cover bg-center md:bg-contain md:bg-right md:bg-no-repeat transition-transform duration-700 hover:scale-105"
                    data-alt="Close up of luxurious gold thread embroidery on dark velvet fabric"
                    style={{
                        backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB_II0R0ouDV3kttnXSn8RIFyi_4MMrmB_9vv1_1aOqn3t9z-N-Aj6Cs0_Y08CVfwtxPbTd1K1czximD-Hald9yO6MZtVR2J5gbDCH3S2G6VPrD9gXx-IPAhMhHp_ArqSzRAa7CWUcqeJPwaXid_56M5aGHy-U1EZGTnCDa6FeYJIVRNcOA4UgqaUPK0NdadXR8o3-FXd3VMJ-oYAeiQjolZzbExbhPXKXwVS-Y555NOptgxcD3oDSxClvWjg4zb8Rv0wGzAbwlPw')"
                    }}
                />
                <div className="absolute bottom-0 left-0 w-full p-6 pb-10 z-20 flex flex-col gap-4 items-center text-center md:inset-y-0 md:h-full md:justify-center md:items-start md:text-left md:pl-10">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-[10px] font-bold tracking-widest uppercase w-max"
                    >
                        Premium Collection
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="font-serif text-4xl md:text-6xl leading-[1.1] font-medium text-white drop-shadow-sm max-w-2xl"
                    >
                        Custom Computer <br className="hidden md:block" /> Embroidery on <span className="text-primary font-script text-5xl md:text-7xl block pt-2 md:pt-4">Premium Fashion</span>
                    </motion.h1>
                </div>
            </motion.div>

            {/* Floating Card */}
            <div className="px-6 -mt-6 relative z-30 flex justify-center md:-mt-20">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col gap-3 p-4 bg-background-light rounded-xl shadow-soft border border-white/50 w-full max-w-md"
                >
                    <p className="text-text-muted text-sm leading-relaxed mb-2">
                        Experience the luxury of bespoke designs stitched with precision on high-quality fabrics tailored just for you.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/designs" className="bg-primary text-white h-12 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all hover:bg-primary-dark">
                            Browse Designs
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </Link>
                        <Link href="/contact" className="bg-transparent border border-text-main/20 text-text-main h-12 rounded-lg font-semibold text-sm flex items-center justify-center hover:bg-black/5 active:scale-[0.98] transition-all">
                            Custom Embroidery
                        </Link>
                    </div>
                </motion.div>
            </div>
        </header>
    );
};

export default Hero;
