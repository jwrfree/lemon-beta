import { CategoryVisuals } from '@/types/visuals';

interface DNAProfile {
    primary: string;
    secondary: string;
    ambient: string;
    gradient: string;
}

/**
 * Returns a high-fidelity visual DNA profile based on a category or color string.
 * Used for dynamic backgrounds, ambient glows, and consistent branding.
 */
export const getVisualDNA = (colorName?: string): DNAProfile => {
    const color = colorName?.toLowerCase() || 'gray';

    // Profiles for common semantic colors
    const profiles: Record<string, DNAProfile> = {
        teal: {
            primary: '#0d9488',
            secondary: '#115e59',
            ambient: 'rgba(13, 148, 136, 0.2)',
            gradient: 'linear-gradient(135deg, #0d9488 0%, #064e4b 100%)'
        },
        emerald: {
            primary: '#059669',
            secondary: '#064e3b',
            ambient: 'rgba(5, 150, 105, 0.2)',
            gradient: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)'
        },
        rose: {
            primary: '#e11d48',
            secondary: '#881337',
            ambient: 'rgba(225, 29, 72, 0.2)',
            gradient: 'linear-gradient(135deg, #e11d48 0%, #881337 100%)'
        },
        blue: {
            primary: '#2563eb',
            secondary: '#1e3a8a',
            ambient: 'rgba(37, 99, 235, 0.2)',
            gradient: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)'
        },
        purple: {
            primary: '#9333ea',
            secondary: '#581c87',
            ambient: 'rgba(147, 51, 234, 0.2)',
            gradient: 'linear-gradient(135deg, #9333ea 0%, #581c87 100%)'
        },
        yellow: {
            primary: '#ca8a04',
            secondary: '#713f12',
            ambient: 'rgba(202, 138, 4, 0.2)',
            gradient: 'linear-gradient(135deg, #ca8a04 0%, #713f12 100%)'
        },
        orange: {
            primary: '#ea580c',
            secondary: '#7c2d12',
            ambient: 'rgba(234, 88, 12, 0.2)',
            gradient: 'linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)'
        },
        pink: {
            primary: '#db2777',
            secondary: '#831843',
            ambient: 'rgba(219, 39, 119, 0.2)',
            gradient: 'linear-gradient(135deg, #db2777 0%, #831843 100%)'
        },
        indigo: {
            primary: '#4f46e5',
            secondary: '#312e81',
            ambient: 'rgba(79, 70, 229, 0.2)',
            gradient: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)'
        },
        cyan: {
            primary: '#0891b2',
            secondary: '#164e63',
            ambient: 'rgba(8, 145, 178, 0.2)',
            gradient: 'linear-gradient(135deg, #0891b2 0%, #164e63 100%)'
        },
        gray: {
            primary: '#4b5563',
            secondary: '#1f2937',
            ambient: 'rgba(75, 85, 99, 0.1)',
            gradient: 'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)'
        }
    };

    // Find profile by keyword match
    for (const key in profiles) {
        if (color.includes(key)) return profiles[key];
    }

    return profiles.gray;
};

/**
 * Extracts a base color string from Tailwind classes like 'text-teal-600'
 */
export const extractBaseColor = (twClass?: string): string => {
    if (!twClass) return 'gray';
    const parts = twClass.split('-');
    if (parts.length < 2) return 'gray';
    // If it's something like 'text-teal-600', parts[1] is 'teal'
    // If it's 'bg-rose-500/10', parts[1] is 'rose'
    return parts[1].split('/')[0];
};
