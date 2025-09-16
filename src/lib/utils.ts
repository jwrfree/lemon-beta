
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isYesterday, formatRelative } from 'date-fns';
import { id } from 'date-fns/locale';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatRelativeDate(date: Date) {
    if (isToday(date)) {
        return 'Hari ini';
    }
    if (isYesterday(date)) {
        return 'Kemarin';
    }
    return format(date, 'EEEE, d MMMM yyyy', { locale: id });
}
