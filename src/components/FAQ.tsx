import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
    {
        question: "How long does delivery take?",
        answer: "Standard shipping typically takes 5-7 business days within India. For international orders, please allow 10-14 business days. We ensure every piece is packed with care to reach you safely."
    },
    {
        question: "Can I customize the design or fabric?",
        answer: "Absolutely. customization is at the heart of Amma. You can request specific thread color combinations or send us your own fabric. Simply select the 'Custom' option on any design page."
    },
    {
        question: "What is your return policy?",
        answer: "We accept returns on standard, non-customized items within 14 days of delivery. However, custom embroidered pieces are made specifically for you and are final sale unless there is a defect."
    }
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-6 md:px-12 max-w-5xl">

                {/* Header */}
                <div className="text-center mb-12 md:mb-16">
                    <span className="text-[#C9A14A] text-xs font-bold tracking-[0.2em] uppercase mb-3 block">
                        Support
                    </span>
                    <h2 className="text-3xl md:text-4xl font-serif text-[#1C1C1C] leading-tight">
                        Common <span className="italic text-[#999999] font-light">Questions</span>
                    </h2>
                </div>

                {/* FAQ List */}
                <div className="grid grid-cols-1 gap-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="group"
                            >
                                <div
                                    className={`
                                        border-b border-[#1C1C1C]/10 transition-colors duration-500
                                        ${isOpen ? 'border-[#C9A14A]/50' : 'group-hover:border-[#1C1C1C]/30'}
                                    `}
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : index)}
                                        className="w-full flex justify-between items-start py-5 text-left focus:outline-none"
                                    >
                                        <span className={`text-lg md:text-xl font-serif transition-colors duration-300 pr-8 ${isOpen ? 'text-[#C9A14A]' : 'text-[#1C1C1C] group-hover:text-[#555]'}`}>
                                            {faq.question}
                                        </span>
                                        <span className={`shrink-0 mt-1 transition-all duration-300 ${isOpen ? 'rotate-0 text-[#C9A14A]' : 'rotate-90 text-[#1C1C1C]/20 group-hover:text-[#1C1C1C]'}`}>
                                            {isOpen ? <Minus size={20} strokeWidth={1} /> : <Plus size={20} strokeWidth={1} />}
                                        </span>
                                    </button>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pb-6 pr-8 max-w-3xl">
                                                    <p className="text-[#555555] font-sans text-sm leading-relaxed">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer Note */}
                <div className="mt-12 text-center">
                    <p className="text-[#999999] text-xs">
                        Still have questions? <a href="/contact" className="text-[#1C1C1C] font-semibold border-b border-[#1C1C1C]/20 hover:border-[#C9A14A] hover:text-[#C9A14A] transition-all">Contact our support team</a>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
