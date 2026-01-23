import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: "How long does delivery take?",
        answer: "Standard shipping takes 5-7 business days within India. For international orders, please allow 10-14 business days. Custom embroidery orders may require an additional 3-5 days for production before dispatch."
    },
    {
        question: "How should I care for the embroidery?",
        answer: "We recommend dry cleaning or gentle hand washing with cold water and mild detergent. Avoid wringing or scrubbing the embroidered areas directly. Iron on the reverse side with a low heat setting to preserve the intricate thread work."
    },
    {
        question: "Can I customize the colors or design?",
        answer: "Yes! We offer a bespoke customization service. You can request specific color combinations or minor design tweaks. Please contact our design team via the 'Contact' page to discuss your specific requirements."
    },
    {
        question: "Do you offer returns or exchanges?",
        answer: "We accept returns and exchanges within 14 days of delivery for standard unworn items with tags attached. Please note that personalized or custom-made items are final sale and cannot be returned unless there is a manufacturing defect."
    },
    {
        question: "Are the colors true to the photos?",
        answer: "We strive for maximum color accuracy in our photography. However, slight variations may occur due to differences in screen calibration and lighting conditions. We are happy to provide additional daylight photos upon request."
    }
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-20 bg-[#F9F9F9]">
            <div className="max-w-3xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif text-[#1C1C1C] mb-4">
                        Have <span className="text-[#C9A14A] italic">Questions?</span>
                    </h2>
                    <p className="text-[#555555] font-inter text-base md:text-lg">
                        Answers about delivery, fabric care, customization, colors, returns, and more.
                    </p>
                </div>

                {/* Accordion List */}
                <div className="space-y-0">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <div
                                key={index}
                                className="border-b border-[#E6E3DE]"
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="w-full flex justify-between items-center py-6 text-left group focus:outline-none"
                                    aria-expanded={isOpen}
                                >
                                    <span className="text-[#1C1C1C] text-lg font-inter font-medium leading-tight pr-8">
                                        {faq.question}
                                    </span>
                                    <span className="text-[#C9A14A] flex-shrink-0 transition-transform duration-300">
                                        {isOpen ? (
                                            <Minus size={20} />
                                        ) : (
                                            <Plus size={20} />
                                        )}
                                    </span>
                                </button>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <p className="text-[#555555] text-base font-inter pb-8 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
