import React from 'react';
import Link from 'next/link';
import { ChevronRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export type BreadcrumbStep = 'designs' | 'service' | 'customize' | 'summary' | 'bag' | 'checkout';

interface CheckoutBreadcrumbsProps {
    currentStep: BreadcrumbStep;
    designId?: string;
    serviceType?: string; // 'stitching' | 'cloth_only' | 'send_fabric'
    className?: string;
    // Optional params to preserve state
    fabricId?: string;
    colorId?: string;
    length?: string | number;
    fabricDetails?: string; // encoded JSON for send_fabric
    // Stitching specific
    garmentId?: string;
    sizeMode?: string;
    standardSizeId?: string;
    editId?: string;
}

export default function CheckoutBreadcrumbs({
    currentStep,
    designId,
    serviceType = 'stitching',
    className = '',
    fabricId,
    colorId,
    length,
    fabricDetails,
    garmentId,
    sizeMode,
    standardSizeId,
    editId
}: CheckoutBreadcrumbsProps) {

    // Define the sequence
    const steps: { id: BreadcrumbStep; label: string; path?: string }[] = [
        { id: 'designs', label: 'Designs', path: '/designs' },
        { id: 'service', label: 'Service', path: designId ? `/service-selection?designId=${designId}` : undefined },
        { id: 'customize', label: 'Customize', path: getCustomizePath(serviceType, designId) },

        { id: 'summary', label: 'Review', path: undefined }, // Changed to 'Review' for clarity
        { id: 'bag', label: 'Bag', path: '/shopping-bag' },
        { id: 'checkout', label: 'Checkout', path: '/checkout' },
    ];

    // Helper to determine if a step is "past" (completed)
    const getStepIndex = (stepId: BreadcrumbStep) => steps.findIndex(s => s.id === stepId);
    const currentIndex = getStepIndex(currentStep);

    function getCustomizePath(type: string, id?: string) {
        if (!id) return undefined;

        let path = '';
        switch (type) {
            case 'cloth_only': path = `/embroidery-cloth-only?designId=${id}`; break;
            case 'send_fabric': path = `/send-your-fabric?designId=${id}`; break;
            default: path = `/embroidery-garment-selection?designId=${id}`; break;
        }

        // Append preserved state
        if (fabricId) path += `&fabricId=${fabricId}`;
        if (colorId) path += `&colorId=${colorId}`;
        if (length) path += `&length=${length}`;
        if (fabricDetails) path += `&fabricDetails=${encodeURIComponent(fabricDetails)}`;

        return path;
    }

    return (
        <nav aria-label="Checkout Progress" className={`w-full overflow-x-auto no-scrollbar py-4 mb-2 flex justify-start md:justify-center ${className}`}>
            <ol className="flex items-center min-w-max px-1">
                {steps.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isFuture = index > currentIndex;
                    const isClickable = isCompleted || (isCurrent && false); // Only past steps are clickable

                    return (
                        <li key={step.id} className="flex items-center">
                            {/* Step Item */}
                            <div className={`flex items-center ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}>

                                {/* Link Wrapper */}
                                {isClickable && step.path ? (
                                    <Link href={step.path} className="group flex flex-col items-center gap-2 outline-none">
                                        <StepContent
                                            step={step}
                                            isCompleted={isCompleted}
                                            isCurrent={isCurrent}
                                        />
                                    </Link>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <StepContent
                                            step={step}
                                            isCompleted={isCompleted}
                                            isCurrent={isCurrent}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Separator */}
                            {index < steps.length - 1 && (
                                <div className={`mx-2 sm:mx-4 w-6 sm:w-10 h-[1px] mb-5 ${isCompleted ? 'bg-[#1C1C1C]' : 'bg-[#E8E6E0]'}`} />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

function StepContent({ step, isCompleted, isCurrent }: { step: any, isCompleted: boolean, isCurrent: boolean }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`
                flex items-center justify-center w-4 h-4 rounded-none transition-all duration-300 ring-2 ring-offset-2
                ${isCompleted ? 'bg-[#1C1C1C] text-white ring-transparent' : ''}
                ${isCurrent ? 'bg-[#1C1C1C] text-transparent ring-[#1C1C1C]/20 ring-offset-[#F9F7F3]' : ''}
                ${!isCompleted && !isCurrent ? 'bg-transparent border border-[#E8E6E0] ring-transparent' : ''}
            `}>
                {isCompleted ? <Check size={10} strokeWidth={2.5} /> : (isCurrent ? <div className="w-1.5 h-1.5 bg-white rounded-none animate-pulse" /> : null)}
            </div>
            <span className={`
                text-[9px] uppercase tracking-[0.2em] font-medium whitespace-nowrap transition-colors duration-300
                ${isCompleted || isCurrent ? 'text-[#1C1C1C]' : 'text-[#999]'}
            `}>
                {step.label}
            </span>
        </div>
    );
}
