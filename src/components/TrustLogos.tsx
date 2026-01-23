import React from 'react';
import { motion } from 'framer-motion';

// Defined with font styles to mimic brand identity in absence of logos
const BRANDS = [
    { name: 'Tanishq', font: 'font-serif' },
    { name: 'FabIndia', font: 'font-serif' },
    { name: 'Nykaa Fashion', font: 'font-sans' },
    { name: 'Myntra', font: 'font-sans uppercase tracking-wider' },
    { name: 'Reliance Trends', font: 'font-sans' },
    { name: 'DTDC', font: 'font-sans font-bold' },
    { name: 'Delhivery', font: 'font-sans' },
    { name: 'Shiprocket', font: 'font-sans' },
    { name: 'Razorpay', font: 'font-sans font-bold' },
];

const TrustLogos = () => {
    return (
        <section className="w-full py-16 md:py-24 bg-background-light overflow-hidden">
            <div className="w-full"> {/* Removed container constraint to allowing full width flow if needed, but keeping text centered */}

                {/* Texts */}
                <div className="text-center mb-12 space-y-3 px-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-3xl md:text-4xl font-serif text-text-main tracking-tight"
                    >
                        Trusted by Thousands
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                        className="text-lg md:text-xl text-text-muted font-light"
                    >
                        Quality you can see and feel
                    </motion.p>
                </div>

                {/* Marquee Container */}
                <div className="relative w-full overflow-hidden">

                    {/* Gradient Masks (The "Blur" Effect) */}
                    <div className="absolute top-0 left-0 z-10 w-32 md:w-64 h-full bg-gradient-to-r from-background-light to-transparent pointer-events-none" />
                    <div className="absolute top-0 right-0 z-10 w-32 md:w-64 h-full bg-gradient-to-l from-background-light to-transparent pointer-events-none" />

                    {/* Scrolling Track */}
                    <div className="flex items-center gap-16 w-max animate-scroll">

                        {/* Set 1 */}
                        {BRANDS.map((brand, idx) => (
                            <LogoItem key={`1-${idx}`} brand={brand} />
                        ))}

                        {/* Set 2 */}
                        {BRANDS.map((brand, idx) => (
                            <LogoItem key={`2-${idx}`} brand={brand} />
                        ))}

                        {/* Set 3 */}
                        {BRANDS.map((brand, idx) => (
                            <LogoItem key={`3-${idx}`} brand={brand} />
                        ))}

                        {/* Set 4 */}
                        {BRANDS.map((brand, idx) => (
                            <LogoItem key={`4-${idx}`} brand={brand} />
                        ))}

                    </div>
                </div>
            </div>
        </section>
    );
};

const LogoItem = ({ brand }: { brand: { name: string, font: string } }) => (
    <div
        className="
      flex-shrink-0 
      opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-default
      grayscale hover:grayscale-0
    "
    >
        <div className="h-[40px] flex items-center justify-center min-w-[120px]">
            <span className={`text-xl text-text-main/80 ${brand.font} whitespace-nowrap`}>
                {brand.name}
            </span>
        </div>
    </div>
);

export default TrustLogos;
