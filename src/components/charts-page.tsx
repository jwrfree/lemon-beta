'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, TrendingUp, ArrowUpRight, ArrowDownLeft, Scale } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useSwipeable } from 'react-swipeable';
import { AnimatePresence, motion } from 'framer-motion';

type TabValue = 'expense' | 'income' | 'net';

const tabs: { value: TabValue; label: string; icon: React.ElementType }[] = [
    { value: 'expense', label: 'Pengeluaran', icon: ArrowDownLeft },
    { value: 'income', label: 'Pemasukan', icon: ArrowUpRight },
    { value: 'net', label: 'Net Income', icon: Scale },
];

const PlaceholderContent = ({ label, icon: Icon }: { label: string, icon: React.ElementType }) => (
    <div className="flex flex-col h-full items-center justify-center text-center p-4 pt-16">
        <div className="p-3 bg-primary/10 rounded-full mb-3">
            <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold">Analisis {label}</h2>
        <p className="text-muted-foreground mt-2 mb-6">Grafik dan data untuk {label} akan muncul di sini.</p>
    </div>
);


export const ChartsPage = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabValue>('expense');
    const [direction, setDirection] = useState(0);

    const handleTabChange = (value: string) => {
        const newIndex = tabs.findIndex(tab => tab.value === value);
        const oldIndex = tabs.findIndex(tab => tab.value === activeTab);
        setDirection(newIndex > oldIndex ? 1 : -1);
        setActiveTab(value as TabValue);
    }
    
    const handlers = useSwipeable({
        onSwipedLeft: () => {
            const currentIndex = tabs.findIndex(tab => tab.value === activeTab);
            if (currentIndex < tabs.length - 1) {
                handleTabChange(tabs[currentIndex + 1].value);
            }
        },
        onSwipedRight: () => {
            const currentIndex = tabs.findIndex(tab => tab.value === activeTab);
            if (currentIndex > 0) {
                handleTabChange(tabs[currentIndex - 1].value);
            }
        },
        preventScrollOnSwipe: true,
        trackMouse: true,
    });

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
        }),
    };

    return (
        <div className="flex flex-col h-full">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Analisis Keuangan</h1>
            </header>
            <main className="flex-1 flex flex-col overflow-hidden">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mx-auto max-w-sm sticky top-0 bg-background p-1 h-auto mt-4">
                       {tabs.map(tab => (
                           <TabsTrigger key={tab.value} value={tab.value} className="flex gap-2 items-center">
                               <tab.icon className="h-4 w-4" />
                               {tab.label}
                            </TabsTrigger>
                       ))}
                    </TabsList>
                </Tabs>
                <div {...handlers} className="flex-1 overflow-hidden relative">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={activeTab}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="absolute w-full h-full"
                        >
                            {activeTab === 'expense' && <PlaceholderContent label="Pengeluaran" icon={ArrowDownLeft} />}
                            {activeTab === 'income' && <PlaceholderContent label="Pemasukan" icon={ArrowUpRight} />}
                            {activeTab === 'net' && <PlaceholderContent label="Net Income" icon={Scale} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};
