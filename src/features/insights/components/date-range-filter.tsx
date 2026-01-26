"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { useCallback } from "react"

export function DateRangeFilter() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Ambil nilai dari URL atau default ke bulan ini
    const from = searchParams.get("from") || format(startOfMonth(new Date()), "yyyy-MM-dd")
    const to = searchParams.get("to") || format(endOfMonth(new Date()), "yyyy-MM-dd")

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set(name, value)
            return params.toString()
        },
        [searchParams]
    )

    const handleDateChange = (key: "from" | "to", value: string) => {
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

    return (
        <div className="flex flex-wrap items-center gap-2 bg-background/50 p-1 rounded-lg border border-border/50 backdrop-blur-sm w-fit">
            <div className="flex items-center gap-2 px-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <input 
                    type="date" 
                    value={from}
                    onChange={(e) => handleDateChange("from", e.target.value)}
                    className="bg-transparent text-sm border-none focus:ring-0 p-0 w-[110px] text-foreground outline-none"
                />
                <span className="text-muted-foreground">-</span>
                <input 
                    type="date" 
                    value={to}
                    onChange={(e) => handleDateChange("to", e.target.value)}
                    className="bg-transparent text-sm border-none focus:ring-0 p-0 w-[110px] text-foreground outline-none"
                />
            </div>
            <div className="h-4 w-[1px] bg-border mx-1 hidden sm:block" />
            <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => setPreset("thisMonth")}>
                    Bulan Ini
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => setPreset("lastMonth")}>
                    Bulan Lalu
                </Button>
            </div>
        </div>
    )
}