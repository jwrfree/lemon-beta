import React from 'react';

export const HomeSkeleton = () => (
    <div className="bg-muted min-h-screen animate-pulse p-4">
        <header className="h-16 flex items-center justify-between mb-6">
            <div className="h-8 w-32 bg-muted-foreground/20 rounded"></div>
            <div className="h-8 w-8 bg-muted-foreground/20 rounded-full"></div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                 <div className="h-48 bg-muted-foreground/20 rounded-md"></div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-muted-foreground/20 rounded-md"></div>
                    <div className="h-32 bg-muted-foreground/20 rounded-md"></div>
                 </div>
            </div>
            <div className="space-y-6">
                <div className="h-64 bg-muted-foreground/20 rounded-md"></div>
                <div className="h-64 bg-muted-foreground/20 rounded-md"></div>
            </div>
        </div>
    </div>
);
