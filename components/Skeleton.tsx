import React from 'react';

const Shimmer: React.FC = () => (
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-slate-200/50 to-transparent"></div>
);

const SkeletonBox: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`relative overflow-hidden bg-slate-200 rounded-md ${className}`}>
        <Shimmer />
    </div>
);

const SkeletonHeader: React.FC = () => (
    <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md h-[68px]">
        <SkeletonBox className="h-6 w-48 bg-white/30" />
        <div className="flex items-center gap-4">
            <SkeletonBox className="h-10 w-24 hidden md:block bg-white/30" />
            <div className="flex flex-col items-end gap-1">
                <SkeletonBox className="h-4 w-24 bg-white/30" />
                <SkeletonBox className="h-3 w-16 bg-white/30" />
            </div>
            <SkeletonBox className="h-8 w-8 rounded-lg bg-white/30" />
        </div>
    </div>
);

const SkeletonControls: React.FC = () => (
    <div className="p-4 bg-surface-card border-b border-border-main flex flex-col md:flex-row items-center justify-between gap-y-4 gap-x-2 sticky top-[68px] z-20 shrink-0">
        <div className="flex items-center justify-between md:justify-start w-full md:w-auto">
            <SkeletonBox className="h-8 w-40" />
            <div className="flex items-center gap-2 ml-4">
                <SkeletonBox className="h-9 w-9 rounded-full" />
                <SkeletonBox className="h-9 w-20" />
                <SkeletonBox className="h-9 w-9 rounded-full" />
            </div>
        </div>
        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
            <SkeletonBox className="h-9 w-40" />
            <SkeletonBox className="h-10 w-28" />
        </div>
    </div>
);

const SkeletonCalendar: React.FC = () => {
    const weeks = Array.from({ length: 5 });
    const days = Array.from({ length: 7 });
    return (
        <div className="p-4 md:p-6 flex flex-col bg-surface-card h-full">
            {/* Weekday Header */}
            <div className="grid grid-cols-7 shrink-0">
                {days.map((_, i) => (
                    <div key={i} className="text-center font-medium text-text-secondary text-sm py-2 border-b border-r border-border-main last:border-r-0 bg-surface-card">
                        <SkeletonBox className="h-5 w-10 mx-auto" />
                    </div>
                ))}
            </div>
            {/* Calendar Body */}
            <div className="flex-grow">
                {weeks.map((_, weekIndex) => (
                    <div key={weekIndex} className="relative border-b border-border-main h-40">
                         <div className="flex absolute inset-0">
                            {days.map((_, dayIndex) => (
                                <div key={dayIndex} className="flex-1 border-r border-border-main last:border-r-0 p-1.5">
                                    <SkeletonBox className="h-5 w-5 mb-2" />
                                    <SkeletonBox className="h-4 w-full mb-1" />
                                    <SkeletonBox className="h-4 w-3/4" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const AppSkeleton: React.FC = () => {
    return (
        <div className="bg-surface-main text-text-primary min-h-screen font-sans flex flex-col h-screen">
            <SkeletonHeader />
            <SkeletonControls />
            <main className="flex-grow overflow-hidden">
                <SkeletonCalendar />
            </main>
        </div>
    );
};
