
export const getCategoryColorHex = (categoryVisuals?: { color: string } | null): string | undefined => {
    if (!categoryVisuals) return undefined;

    const color = categoryVisuals.color;
    if (color.includes('yellow')) return '#ca8a04';
    if (color.includes('blue')) return '#2563eb';
    if (color.includes('purple')) return '#9333ea';
    if (color.includes('cyan')) return '#0891b2';
    if (color.includes('orange')) return '#ea580c';
    if (color.includes('pink')) return '#db2777';
    if (color.includes('green')) return '#16a34a';
    if (color.includes('indigo')) return '#4f46e5';
    if (color.includes('red')) return '#dc2626';
    if (color.includes('teal')) return '#0d9488';
    if (color.includes('emerald')) return '#059669';

    return 'hsl(var(--primary))';
};
