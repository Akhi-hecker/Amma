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
                                    <Link href={step.path} className="group flex items-center gap-2 outline-none">
                                        <StepContent
                                            step={step}
                                            isCompleted={isCompleted}
                                            isCurrent={isCurrent}
                                        />
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <StepContent
                                            step={step}
                                            isCompleted={isCompleted}
                                            isCurrent={isCurrent}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Chevron Separator */}
                            {index < steps.length - 1 && (
                                <ChevronRight
                                    size={16}
                                    className={`mx-2 sm:mx-4 ${isCompleted ? 'text-[#C9A14A]' : 'text-gray-300'}`}
                                    strokeWidth={isCompleted ? 2 : 1.5}
                                />
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
        <>
            <div className={`
                flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-all duration-300
                ${isCompleted ? 'bg-[#C9A14A] text-white' : ''}
                ${isCurrent ? 'bg-[#1C1C1C] text-white scale-110 shadow-md' : ''}
                ${!isCompleted && !isCurrent ? 'bg-gray-100 text-gray-400' : ''}
            `}>
                {isCompleted ? <Check size={12} strokeWidth={3} /> : (isCurrent ? <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> : '')}
                {!isCompleted && !isCurrent && <span className="opacity-0">.</span>}
            </div>
            <span className={`
                text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-300
                ${isCompleted ? 'text-[#1C1C1C] group-hover:text-[#C9A14A]' : ''}
                ${isCurrent ? 'text-[#1C1C1C] font-semibold' : ''}
                ${!isCompleted && !isCurrent ? 'text-gray-400' : ''}
            `}>
                {step.label}
            </span>
        </>
    );
}
