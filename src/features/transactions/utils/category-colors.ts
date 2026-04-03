
export const getCategoryColorHex = (categoryVisuals?: { color: string } | null): string | undefined => {
    if (!categoryVisuals) return undefined;

    const color = categoryVisuals.color;
    if (color.includes('yellow')) return 'hsl(var(--yellow-600))';
    if (color.includes('blue')) return 'hsl(var(--blue-600))';
    if (color.includes('purple')) return 'hsl(var(--purple-600))';
    if (color.includes('cyan')) return 'hsl(var(--cyan-600))';
    if (color.includes('orange')) return 'hsl(var(--orange-600))';
    if (color.includes('pink')) return 'hsl(var(--pink-600))';
    if (color.includes('green')) return 'hsl(var(--green-600))';
    if (color.includes('indigo')) return 'hsl(var(--indigo-600))';
    if (color.includes('red')) return 'hsl(var(--red-600))';
    if (color.includes('teal')) return 'hsl(var(--teal-600))';
    if (color.includes('emerald')) return 'hsl(var(--emerald-600))';

    return 'hsl(var(--primary))';
};
