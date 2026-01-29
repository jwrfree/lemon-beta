import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Sun, CloudSun, Moon, Sunset, Calendar, Smile } from 'lucide-react';

interface DynamicSuggestionsProps {
    onSuggestionClick: (text: string) => void;
}

type TimeOfDay = 'pagi' | 'siang' | 'sore' | 'malam';
type DayContext = 'normal' | 'weekend' | 'gajian';

export const DynamicSuggestions = ({ onSuggestionClick }: DynamicSuggestionsProps) => {
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('pagi');
    const [dayContext, setDayContext] = useState<DayContext>('normal');
    
    useEffect(() => {
        const now = new Date();
        const hour = now.getHours();
        const date = now.getDate();
        const day = now.getDay(); // 0 = Sunday, 6 = Saturday

        // Determine Time of Day
        if (hour >= 4 && hour < 11) setTimeOfDay('pagi');
        else if (hour >= 11 && hour < 15) setTimeOfDay('siang');
        else if (hour >= 15 && hour < 19) setTimeOfDay('sore');
        else setTimeOfDay('malam');

        // Determine Day Context (Priority: Payday > Weekend > Normal)
        if (date >= 25 || date <= 5) {
            setDayContext('gajian');
        } else if (day === 0 || day === 6) {
            setDayContext('weekend');
        } else {
            setDayContext('normal');
        }
    }, []);

    const getGreeting = () => {
        // Special Greetings based on Context
        if (dayContext === 'gajian') {
            return { text: "Saatnya Atur Gaji!", icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-500/10", ring: "ring-emerald-500/5" };
        }
        if (dayContext === 'weekend') {
            return { text: "Happy Weekend!", icon: Smile, color: "text-pink-500", bg: "bg-pink-500/10", ring: "ring-pink-500/5" };
        }

        // Fallback to Time of Day Greetings
        switch (timeOfDay) {
            case 'pagi': return { text: "Selamat Pagi!", icon: Sun, color: "text-orange-500", bg: "bg-orange-500/10", ring: "ring-orange-500/5" };
            case 'siang': return { text: "Selamat Siang!", icon: CloudSun, color: "text-sky-500", bg: "bg-sky-500/10", ring: "ring-sky-500/5" };
            case 'sore': return { text: "Selamat Sore!", icon: Sunset, color: "text-amber-500", bg: "bg-amber-500/10", ring: "ring-amber-500/5" };
            case 'malam': return { text: "Selamat Malam!", icon: Moon, color: "text-indigo-500", bg: "bg-indigo-500/10", ring: "ring-indigo-500/5" };
        }
    };

    const getSuggestions = () => {
        const common = [
            "Pindah 500rb dari BCA ke Kas"
        ];

        if (dayContext === 'gajian') {
            return [
                "Gaji masuk 10jt di Mandiri",
                "Bayar listrik 500rb",
                "Bayar kosan 1.5jt",
                "Belanja bulanan 1jt",
                "Topup investasi 500rb"
            ];
        }

        if (dayContext === 'weekend') {
            const weekendActivity = timeOfDay === 'malam' ? "Makan malam di mall 200rb" : "Tiket bioskop 50rb";
            return [
                weekendActivity,
                "Bayar parkir mall 15rb",
                "Jajan snack 35rb",
                "Isi bensin full tank 50rb",
                ...common
            ];
        }
        
        switch (timeOfDay) {
            case 'pagi':
                return [
                    "Sarapan bubur ayam 15rb",
                    "Kopi susu gula aren 20rb",
                    "Ojek online ke kantor 25rb",
                    ...common
                ];
            case 'siang':
                return [
                    "Makan siang paket hemat 25rb",
                    "Es teh manis 5rb",
                    "Bayar parkir 2rb",
                    ...common
                ];
            case 'sore':
                return [
                    "Beli gorengan 10rb",
                    "Belanja di minimarket 50rb",
                    "Ojek online pulang kerja 20rb",
                    ...common
                ];
            case 'malam':
                return [
                    "Makan malam nasi goreng 18rb",
                    "Martabak manis keju 35rb",
                    "Bayar listrik 200rb",
                    ...common
                ];
        }
    };

    const greeting = getGreeting();
    const suggestions = getSuggestions();
    const Icon = greeting.icon;

    return (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 animate-in fade-in duration-500 max-w-sm mx-auto">
            <div className={`p-4 rounded-2xl mb-6 ring-8 ${greeting.bg} ${greeting.ring}`}>
                <Icon className={`h-10 w-10 ${greeting.color}`} strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-semibold text-foreground">{greeting.text}</h2>
            <p className="mt-2 text-sm leading-relaxed">
                {dayContext === 'gajian' 
                    ? "Sudah alokasikan pos-pos pengeluaran bulan ini?" 
                    : dayContext === 'weekend'
                        ? "Nikmati akhir pekanmu! Jangan lupa catat pengeluaran ya."
                        : `Ada pengeluaran apa ${timeOfDay === 'malam' ? 'hari ini' : 'saat ini'}? Ceritakan saja.`
                }
            </p>
            
            <div className="mt-10 w-full">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-semibold tracking-[0.05em] text-muted-foreground/60">
                        {dayContext === 'gajian' ? 'Rutin Bulanan' : dayContext === 'weekend' ? 'Ide Akhir Pekan' : `Contoh ${timeOfDay} ini`}
                    </p>
                    <div className="h-px flex-1 bg-border/50 ml-3" />
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {suggestions.map((s, idx) => (
                        <button
                            key={`${timeOfDay}-${dayContext}-${idx}`}
                            type="button"
                            onClick={() => onSuggestionClick(s)}
                            className="text-xs text-left bg-card hover:bg-primary/5 px-4 py-3 rounded-xl active:scale-[0.98] transition-all flex items-center justify-between group"
                        >
                            <span className="text-foreground/80 group-hover:text-primary font-medium">{s}</span>
                            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-8 p-4 bg-muted/50 rounded-2xl w-full">
                <p className="text-[10px] font-semibold text-muted-foreground mb-2">💡 Tips Cerdas</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed text-left">
                    Gunakan kata hubung seperti <b>"dan"</b> atau <b>tanda koma</b> untuk mencatat banyak transaksi sekaligus.
                </p>
            </div>
        </div>
    );
};
