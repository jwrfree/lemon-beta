import React from 'react';

export const HomeSkeleton = () => (
    <div className="bg-[#021f1e] min-h-screen animate-pulse p-4 space-y-6">
        <header className="px-1 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/5 rounded-full"></div>
                <div className="space-y-2">
                    <div className="h-3 w-20 bg-white/5 rounded"></div>
                    <div className="h-5 w-24 bg-white/5 rounded"></div>
                </div>
            </div>
            <div className="flex gap-2">
                <div className="h-9 w-9 bg-white/5 rounded-full"></div>
                <div className="h-9 w-9 bg-white/5 rounded-full"></div>
            </div>
        </header>
        
        <div className="h-64 bg-white/5 rounded-card-premium mx-1"></div>
        
        <div className="grid grid-cols-4 gap-4 px-1">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col items-center gap-2">
                    <div className="h-16 w-16 bg-white/5 rounded-full"></div>
                    <div className="h-3 w-12 bg-white/5 rounded"></div>
                </div>
            ))}
        </div>

        <div className="space-y-4 px-1">
            <div className="h-4 w-32 bg-white/5 rounded"></div>
            <div className="flex gap-4 overflow-hidden">
                <div className="h-32 w-44 bg-white/5 rounded-card-premium shrink-0"></div>
                <div className="h-32 w-44 bg-white/5 rounded-card-premium shrink-0"></div>
            </div>
        </div>
    </div>
);
