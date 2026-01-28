import React, { useRef } from 'react';
import Head from 'next/head';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

export default function AboutPage() {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans text-[#1C1C1C]">
            <Head>
                <title>About | Amma</title>
                <meta name="description" content="Bridging the gap between timeless tradition and modern elegance." />
            </Head>

            {/* 1. Hero Section with Background */}
            <div ref={targetRef} className="relative h-[80vh] md:h-[90vh] min-h-[500px] overflow-hidden flex items-center justify-center">
                {/* Background Image */}
                <motion.div
                    style={{ opacity: heroOpacity, scale: heroScale }}
                    className="absolute inset-0 z-0"
                >
                    <Image
                        src="/images/about-hero.png"
                        alt="Fine embroidery texture background"
                        fill
                        className="object-cover opacity-80"
                        priority
                    />
                    <div className="absolute inset-0 bg-white/10" /> {/* Subtle light overlay */}
                </motion.div>

                {/* Content */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="relative z-10 text-center max-w-4xl px-4 md:px-6"
                >
                    <motion.p variants={fadeInUp} className="text-[#8B6D36] text-xs md:text-sm font-bold tracking-[0.3em] uppercase mb-4 md:mb-6">
                        Established 1985
                    </motion.p>
                    <motion.h1 variants={fadeInUp} className="font-serif text-4xl md:text-6xl lg:text-8xl leading-tight mb-6 md:mb-8 text-[#1C1C1C]">
                        The Art of <br /> <span className="italic text-[#8B6D36]">Slow Fashion</span>
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-[#1C1C1C] text-base md:text-xl leading-relaxed max-w-2xl mx-auto font-light font-serif">
                        Bridging the gap between timeless tradition and modern elegance. A sanctuary for those who value the language of thread.
                    </motion.p>
                </motion.div>
            </div>

            {/* 2. Who We Are (Split Layout) */}
            <section className="py-16 md:py-32 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="font-serif text-3xl md:text-5xl text-[#1C1C1C] mb-6 md:mb-8 leading-tight">
                            More than a boutique. <br />
                            <span className="italic text-[#C9A14A]">A Tribute.</span>
                        </h2>
                        <div className="h-0.5 w-16 md:w-24 bg-[#C9A14A] mb-6 md:mb-8" />
                        <p className="text-[#5A5751] text-base md:text-lg leading-relaxed mb-6">
                            Amma started as a humble workshop, driven by a passion for preserving the intricate art of hand embroidery. We believe that true luxury lies in the details—the imperfect perfection of a hand-stitched motif, the texture of raw silk, and the patience of a master artisan.
                        </p>
                        <p className="text-[#5A5751] text-base md:text-lg leading-relaxed">
                            Every garment that leaves our studio carries a story. Not just of the person who wears it, but of the hands that created it.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative h-[400px] md:h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl"
                    >
                        <Image
                            src="/images/about-artisan.png"
                            alt="Artisan hands working on embroidery"
                            fill
                            className="object-cover"
                        />
                    </motion.div>
                </div>
            </section>

            {/* 3. What We Offer (Grid/Carousel) */}
            <section className="bg-white py-16 md:py-32 border-y border-[#E8E6E0]">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-10 md:mb-20 px-6"
                    >
                        <h2 className="font-serif text-3xl md:text-5xl mb-4 md:mb-6">Our Craft</h2>
                        <p className="text-[#5A5751] text-base md:text-lg max-w-2xl mx-auto">We bring together the finest materials, modern technology, and masterful techniques.</p>
                    </motion.div>

                    {/* Mobile: Horizontal Scroll Snap Carousel | Desktop: Grid */}
                    <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 overflow-x-auto md:overflow-visible pb-8 md:pb-0 px-6 snap-x snap-mandatory scrollbar-hide -mx-6 md:mx-0 before:shrink-0 before:w-6 after:shrink-0 after:w-6 md:before:content-none md:after:content-none">
                        {[
                            {
                                title: "Curated Fabrics",
                                image: "/images/about-fabrics.png",
                                desc: "Sourced from the finest mills. Pure silks, breathable linens, and soft cottons selected for their drape."
                            },
                            {
                                title: "Signature Handwork",
                                image: "/images/about-embroidery.png",
                                desc: "Intricate Zardosi and delicate thread work. Our hand embroidery is dense, durable, and indistinguishable from art."
                            },
                            {
                                title: "Computer Embroidery",
                                image: "/images/about-computer-embroidery.png",
                                desc: "High-precision automated stitching for complex geometric patterns, logos, and consistent large-scale motifs."
                            },
                            {
                                title: "Custom Stitching",
                                image: "/images/about-stitching.png",
                                desc: "Precision tailoring that honors your silhouette. We combine traditional drafting with modern fit techniques."
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group cursor-pointer flex flex-col min-w-[280px] md:min-w-0 snap-center"
                            >
                                <div className="relative h-[350px] md:h-[300px] mb-6 overflow-hidden rounded-2xl md:rounded-xl bg-gray-100 shadow-md md:shadow-none">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-none" /> {/* Mobile text overlay gradient */}

                                    {/* Mobile Title Overlay (for cooler look) */}
                                    <h3 className="absolute bottom-4 left-4 font-serif text-2xl text-white md:hidden drop-shadow-md">{item.title}</h3>
                                </div>
                                <h3 className="hidden md:block font-serif text-xl md:text-2xl mb-3 group-hover:text-[#C9A14A] transition-colors">{item.title}</h3>
                                <p className="text-[#5A5751] leading-relaxed text-sm">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3.5. Masterpiece in Focus (New Section) */}
            <section className="py-16 md:py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                        {/* Image Side */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative h-[500px] md:h-[700px] w-full rounded-tr-[50px] rounded-bl-[50px] md:rounded-tr-[100px] md:rounded-bl-[100px] overflow-hidden shadow-2xl"
                        >
                            <Image
                                src="/images/about-masterpiece.png"
                                alt="The Royal Emerald Bridal Blouse"
                                fill
                                className="object-cover"
                            />
                            {/* Floating details card */}
                            <div className="absolute bottom-4 left-4 right-4 md:right-auto md:bottom-8 md:left-8 bg-white/95 backdrop-blur-md p-5 md:p-6 shadow-lg rounded-xl md:rounded-2xl border border-white/50">
                                <p className="font-serif text-lg md:text-xl mb-1">The Royal Emerald</p>
                                <p className="text-[#8B6D36] text-[10px] md:text-xs uppercase tracking-widest font-bold">Signature Collection</p>
                            </div>
                        </motion.div>

                        {/* Text Side */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="text-[#C9A14A] font-bold tracking-widest uppercase text-xs md:text-sm mb-4 block">Archive No. 085</span>
                            <h2 className="font-serif text-3xl md:text-5xl text-[#1C1C1C] mb-6 md:mb-8 leading-tight">
                                Anatomy of a <br />
                                <span className="italic text-[#8B6D36]">Masterpiece</span>
                            </h2>
                            <p className="text-[#5A5751] text-base md:text-lg leading-relaxed mb-8">
                                To understand Amma, one must look closer. This emerald velvet blouse is not just a garment; it is 120 hours of devotion.
                            </p>

                            <div className="space-y-6 md:space-y-8">
                                {[
                                    { label: "The Base", value: "Pure Italian Velvet", desc: "Selected for its depth of color and ability to hold heavy structure." },
                                    { label: "The Craft", value: "Antique Zardosi & French Knots", desc: "Hand-twisted gold wires layered with micro-pearls." },
                                    { label: "The Fit", value: "Bespoke Sculpting", desc: "Cut to a unique 18-point measurement profile for a second-skin fit." }
                                ].map((stat, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="h-full w-0.5 bg-gray-200 group-hover:bg-[#C9A14A] transition-colors duration-500 mt-1"></div>
                                        <div>
                                            <h4 className="font-serif text-base md:text-lg text-[#1C1C1C]">{stat.label}</h4>
                                            <p className="text-[#8B6D36] font-medium mb-1 text-sm md:text-base">{stat.value}</p>
                                            <p className="text-xs md:text-sm text-gray-500 leading-relaxed">{stat.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 4. The Process (Enhanced Visuals) */}
            <section className="py-16 md:py-32 px-6 bg-[#F9F7F3] overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 md:mb-20">
                        <h2 className="font-serif text-3xl md:text-5xl mb-6">From Concept to Creation</h2>
                        <div className="h-px w-24 bg-[#C9A14A] mx-auto opacity-50"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[2.5rem] left-0 right-0 h-0.5 bg-[#E8E6E0] -z-0" />

                        {/* Connecting Line (Mobile) */}
                        <div className="md:hidden absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-transparent via-[#C9A14A]/40 to-transparent -z-0" />

                        {[
                            { step: "01", title: "Discover", text: "Explore our curated designs and fabric bases." },
                            { step: "02", title: "Personalize", text: "Customize colors and provide measurements." },
                            { step: "03", title: "Craft", text: "Expert artisans bring your vision to life." },
                            { step: "04", title: "Receive", text: "Quality checked and delivered to you." }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15 }}
                                className="relative z-10 flex flex-col items-center text-center group bg-[#F9F7F3] py-4"
                            >
                                <div className="w-20 h-20 rounded-full bg-white border border-[#E8E6E0] flex items-center justify-center font-serif text-2xl text-[#C9A14A] shadow-sm mb-6 group-hover:border-[#C9A14A] group-hover:scale-110 transition-all duration-300 relative z-10">
                                    {item.step}
                                </div>
                                <h3 className="font-serif text-xl mb-3 bg-[#F9F7F3] px-2">{item.title}</h3>
                                <p className="text-[#5A5751] text-sm max-w-[200px] leading-relaxed bg-[#F9F7F3] px-1">{item.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


            {/* Closing */}
            <footer className="text-center py-20 border-t border-[#E8E6E0] bg-white">
                <p className="font-serif text-3xl md:text-5xl text-[#1C1C1C] italic mb-4">Amma.</p>
                <p className="text-[#999] tracking-widest text-sm uppercase">Crafting elegance since 1985</p>
            </footer>
        </div>
    );
}
