
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isYesterday } from 'date-fns';
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

export type ImageCompressionOptions = {
    maxDimension?: number;
    quality?: number;
};

export async function compressImageFile(
    file: File,
    { maxDimension = 1280, quality = 0.8 }: ImageCompressionOptions = {},
): Promise<string> {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        throw new Error('Image compression is only available in the browser.');
    }

    const objectUrl = URL.createObjectURL(file);

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (event) => reject(event);
        img.src = objectUrl;
    }).finally(() => {
        URL.revokeObjectURL(objectUrl);
    });

    const largestSide = Math.max(image.width, image.height) || 1;
    const scale = Math.min(1, maxDimension / largestSide);
    const targetWidth = Math.max(1, Math.round(image.width * scale));
    const targetHeight = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Canvas 2D context is not available.');
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    return canvas.toDataURL('image/jpeg', quality);
}

export function getDataUrlSizeInBytes(dataUrl: string): number {
    const base64 = dataUrl.split(',')[1];
    if (!base64) return 0;

    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
    return Math.max(0, Math.ceil((base64.length * 3) / 4) - padding);
}

export function normalizeDateInput(value: string | Date | null | undefined): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value;
    return value.toISOString();
}
