import { useState, useCallback } from 'react';

/**
 * Hook to handle currency input with automatic formatting
 */
export const useCurrencyInput = (initialValue: number | string = '') => {
    const format = (val: number | string) => {
        const num = typeof val === 'number' ? val : parseInt(val.toString().replace(/[^0-9]/g, '')) || 0;
        return num === 0 && val === '' ? '' : new Intl.NumberFormat('id-ID').format(num);
    };

    const [formattedValue, setFormattedValue] = useState<string>(() => format(initialValue));

    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement> | string) => {
        const value = typeof e === 'string' ? e : e.target.value;
        const rawValue = value.replace(/[^0-9]/g, '');
        if (rawValue === '') {
            setFormattedValue('');
            return;
        }
        const numValue = parseInt(rawValue) || 0;
        setFormattedValue(new Intl.NumberFormat('id-ID').format(numValue));
    }, []);

    const getRawValue = useCallback(() => {
        return parseInt(formattedValue.replace(/[^0-9]/g, '')) || 0;
    }, [formattedValue]);

    const setValue = useCallback((val: number | string) => {
        setFormattedValue(format(val));
    }, []);

    return {
        formattedValue,
        onChange,
        getRawValue,
        setValue,
    };
};
