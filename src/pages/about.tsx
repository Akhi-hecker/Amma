import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans pb-20 pt-[80px]">
            <Head>
                <title>Our Story | Amma Embroidery</title>
            </Head>

            {/* Hero Section */}
            <section className="relative px-4 py-12 md:py-20 overflow-hidden">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[#C9A14A] text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
                    >
                        Since 1985
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-serif text-[#1C1C1C] mb-6 leading-tight"
                    >
                        The Art of <br />
                        <span className="italic text-[#C9A14A]">Timeless Embroidery</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-[#5A5751] text-lg leading-relaxed max-w-2xl mx-auto"
                    >
                        Weaving stories into fabric, one stitch at a time. Amma is a tribute to the hands that create and the traditions that endure.
                    </motion.p>
                </div>
            </section>

            {/* The Legacy Section */}
            <section className="px-4 py-16 bg-white border-y border-[#E8E6E0]">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-serif text-[#1C1C1C] mb-6">The Amma Legacy</h2>
                        <div className="h-1 w-20 bg-[#C9A14A] mb-8" />
                        <p className="text-[#5A5751] leading-loose mb-6">
                            Amma started as a humble workshop in the heart of the city, driven by a passion for preserving the intricate art of hand embroidery. Over decades, it has evolved into a sanctuary for artisans and a destination for those who seek more than just clothing—they seek craftsmanship.
                        </p>
                        <p className="text-[#5A5751] leading-loose">
                            Named after the universal word for mother, 'Amma' embodies care, patience, and the warmth of handmade artistry. Every garment that leaves our studio carries the personal touch of a master artisan.
                        </p>
                    </motion.div>
                    <div className="relative aspect-square md:aspect-[4/5] bg-[#F9F7F3] rounded-2xl overflow-hidden shadow-lg">
                        <div className="absolute inset-0 bg-[#C9A14A]/10 mix-blend-multiply" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-serif text-8xl text-black/5">AMMA</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Process - Step Cards */}
            <section className="px-4 py-20 bg-[#F9F7F3]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-serif text-[#1C1C1C] mb-2">Our Process</h2>
                        <p className="text-[#5A5751]">From concept to creation</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Selection", desc: "Sourcing the finest fabrics—silks, cottons, and linens that serve as the perfect canvas." },
                            { title: "Design", desc: "Sketching motifs inspired by nature, heritage, and contemporary art forms." },
                            { title: "Embroidery", desc: "Hand-stitching each detail with precision, taking days or even weeks to complete a single piece." }
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-8 rounded-xl shadow-sm border border-[#E8E6E0] hover:shadow-md transition-shadow"
                            >
                                <span className="text-5xl font-serif text-[#C9A14A]/20 mb-4 block">0{i + 1}</span>
                                <h3 className="text-xl font-medium text-[#1C1C1C] mb-3">{step.title}</h3>
                                <p className="text-[#5A5751] text-sm leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vision / CTA */}
            <section className="px-4 py-20 bg-[#1C1C1C] text-white">
                <div className="max-w-3xl mx-auto text-center">
                    <Star className="text-[#C9A14A] w-8 h-8 mx-auto mb-6" fill="#C9A14A" />
                    <h2 className="text-3xl md:text-5xl font-serif mb-8 leading-tight">
                        Bringing Tradition <br /> to Modern Wear
                    </h2>
                    <p className="text-white/70 text-lg mb-10 leading-relaxed">
                        We believe that tradition is not about looking back, but about carrying the best of the past forward. Join us in celebrating the art of slow fashion.
                    </p>
                    <Link
                        href="/designs"
                        className="inline-flex items-center gap-3 bg-[#C9A14A] text-white px-8 py-4 rounded-full font-medium hover:bg-[#B89240] transition-colors"
                    >
                        Explore Our Collection
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </div>
    );
}
