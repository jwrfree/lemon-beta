"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { startOfMonth, endOfMonth, subMonths, format, parseISO } from "date-fns"
import { id as dateFnsLocaleId } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react"
import { useCallback, useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export function DateRangeFilter() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Ambil nilai dari URL atau default ke bulan ini
    const fromStr = searchParams.get("from") || (isMounted ? format(startOfMonth(new Date()), "yyyy-MM-dd") : "")
    const toStr = searchParams.get("to") || (isMounted ? format(endOfMonth(new Date()), "yyyy-MM-dd") : "")

    const fromDate = fromStr ? parseISO(fromStr) : undefined
    const toDate = toStr ? parseISO(toStr) : undefined

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set(name, value)
            return params.toString()
        },
        [searchParams]
    )

    const handleDateChange = (key: "from" | "to", date: Date | undefined) => {
        if (!date) return
        const value = format(date, "yyyy-MM-dd")
        router.push(`${pathname}?${createQueryString(key, value)}`)
    }

    const setPreset = (preset: "thisMonth" | "lastMonth") => {
        const now = new Date()
        let start, end
        
        if (preset === "thisMonth") {
            start = startOfMonth(now)
            end = endOfMonth(now)
        } else {
            const last = subMonths(now, 1)
            start = startOfMonth(last)
            end = endOfMonth(last)
        }

        const params = new URLSearchParams(searchParams.toString())
        params.set("from", format(start, "yyyy-MM-dd"))
        params.set("to", format(end, "yyyy-MM-dd"))
        router.push(`${pathname}?${params.toString()}`)
    }

    if (!isMounted) {
        return <div className="h-10 w-[300px] animate-pulse bg-muted rounded-lg" />
    }

    return (
        <div className="flex flex-wrap items-center gap-2 bg-background p-1.5 rounded-xl border border-border shadow-sm w-fit">
            <div className="flex items-center gap-1.5 px-1">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 gap-2 px-2 font-medium hover:bg-muted/50"
                        >
                            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs">
                                {fromDate ? format(fromDate, "d MMM yyyy", { locale: dateFnsLocaleId }) : "Dari"}
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar 
                            mode="single" 
                            selected={fromDate} 
                            onSelect={(date) => handleDateChange("from", date)} 
                            initialFocus 
                            locale={dateFnsLocaleId}
                        />
                    </PopoverContent>
                </Popover>

                <ChevronRight className="h-3 w-3 text-muted-foreground/40" />

                <Popover>
                    <PopoverTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 gap-2 px-2 font-medium hover:bg-muted/50"
                        >
                            <span className="text-xs">
                                {toDate ? format(toDate, "d MMM yyyy", { locale: dateFnsLocaleId }) : "Sampai"}
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar 
                            mode="single" 
                            selected={toDate} 
                            onSelect={(date) => handleDateChange("to", date)} 
                            initialFocus 
                            locale={dateFnsLocaleId}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            
            <div className="h-4 w-[1px] bg-border/60 mx-1 hidden sm:block" />
            
            <div className="flex gap-1">
                <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-7 text-[10px] font-bold uppercase tracking-wider px-2.5 bg-muted/50 hover:bg-muted" 
                    onClick={() => setPreset("thisMonth")}
                >
                    Bulan Ini
                </Button>
                <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-7 text-[10px] font-bold uppercase tracking-wider px-2.5 bg-muted/50 hover:bg-muted" 
                    onClick={() => setPreset("lastMonth")}
                >
                    Bulan Lalu
                </Button>
            </div>
        </div>
    )
}