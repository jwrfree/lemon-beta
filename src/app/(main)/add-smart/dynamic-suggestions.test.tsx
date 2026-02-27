import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { DynamicSuggestions } from './dynamic-suggestions';

describe('DynamicSuggestions', () => {
    const mockOnSuggestionClick = vi.fn();

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it('displays "Selamat Pagi!" between 04:00 and 10:59 (Normal Day)', () => {
        // Set time to 08:00, 10th of Month (Normal), Wednesday (Normal)
        const date = new Date(2024, 0, 10, 8, 0, 0); 
        vi.setSystemTime(date);

        render(<DynamicSuggestions onSuggestionClick={mockOnSuggestionClick} />);
        
        expect(screen.getByText('Selamat Pagi!')).toBeDefined();
        expect(screen.getByText('Contoh pagi ini')).toBeDefined();
        expect(screen.getByText('Sarapan bubur ayam 15rb')).toBeDefined();
    });

    it('displays "Selamat Siang!" between 11:00 and 14:59 (Normal Day)', () => {
        // Set time to 13:00, 10th of Month (Normal), Wednesday (Normal)
        const date = new Date(2024, 0, 10, 13, 0, 0);
        vi.setSystemTime(date);

        render(<DynamicSuggestions onSuggestionClick={mockOnSuggestionClick} />);
        
        expect(screen.getByText('Selamat Siang!')).toBeDefined();
        expect(screen.getByText('Contoh siang ini')).toBeDefined();
        expect(screen.getByText('Makan siang paket hemat 25rb')).toBeDefined();
    });

    it('displays "Selamat Sore!" between 15:00 and 18:59 (Normal Day)', () => {
        // Set time to 16:00, 10th of Month (Normal), Wednesday (Normal)
        const date = new Date(2024, 0, 10, 16, 0, 0);
        vi.setSystemTime(date);

        render(<DynamicSuggestions onSuggestionClick={mockOnSuggestionClick} />);
        
        expect(screen.getByText('Selamat Sore!')).toBeDefined();
        expect(screen.getByText('Contoh sore ini')).toBeDefined();
        expect(screen.getByText('Beli gorengan 10rb')).toBeDefined();
    });

    it('displays "Selamat Malam!" between 19:00 and 03:59 (Normal Day)', () => {
        // Set time to 20:00, 10th of Month (Normal), Wednesday (Normal)
        const date = new Date(2024, 0, 10, 20, 0, 0);
        vi.setSystemTime(date);

        render(<DynamicSuggestions onSuggestionClick={mockOnSuggestionClick} />);
        
        expect(screen.getByText('Selamat Malam!')).toBeDefined();
        expect(screen.getByText('Contoh malam ini')).toBeDefined();
        expect(screen.getByText('Makan malam nasi goreng 18rb')).toBeDefined();
    });

    it('displays "Happy Weekend!" on Saturday/Sunday (Not Payday)', () => {
        // Set time to Saturday, 13th (Weekend, Not Payday)
        // Jan 13, 2024 was a Saturday
        const date = new Date(2024, 0, 13, 10, 0, 0); 
        vi.setSystemTime(date);

        render(<DynamicSuggestions onSuggestionClick={mockOnSuggestionClick} />);
        
        expect(screen.getByText('Happy Weekend!')).toBeDefined();
        expect(screen.getByText('Ide Akhir Pekan')).toBeDefined();
        expect(screen.getByText('Tiket bioskop 50rb')).toBeDefined();
    });

    it('displays "Saatnya Atur Gaji!" on Payday (Date 25-5)', () => {
        // Set time to 25th (Payday)
        const date = new Date(2024, 0, 25, 10, 0, 0); 
        vi.setSystemTime(date);

        render(<DynamicSuggestions onSuggestionClick={mockOnSuggestionClick} />);
        
        expect(screen.getByText('Saatnya Atur Gaji!')).toBeDefined();
        expect(screen.getByText('Rutin Bulanan')).toBeDefined();
        expect(screen.getByText('Gaji masuk 10jt di Mandiri')).toBeDefined();
    });

    it('prioritizes Payday over Weekend', () => {
        // Set time to a Weekend that is ALSO Payday range
        // Jan 27, 2024 was a Saturday (Weekend) AND Date >= 25 (Payday)
        const date = new Date(2024, 0, 27, 10, 0, 0); 
        vi.setSystemTime(date);

        render(<DynamicSuggestions onSuggestionClick={mockOnSuggestionClick} />);
        
        // Should show Payday greeting, not Weekend
        expect(screen.getByText('Saatnya Atur Gaji!')).toBeDefined();
        expect(screen.queryByText('Happy Weekend!')).toBeNull();
    });


    it('shows personalized suggestions when provided', () => {
        const date = new Date(2024, 0, 10, 8, 0, 0);
        vi.setSystemTime(date);

        render(
            <DynamicSuggestions
                onSuggestionClick={mockOnSuggestionClick}
                personalizedSuggestions={[{ text: "Ngopi kantor 18000", reason: "sering muncul di waktu pagi", confidence: "high", amountHint: "Biasanya sekitar Rp18.000", sequenceHint: "Biasanya lanjut ke kategori Transport" }, { text: "Makan siang 30000", reason: "pola hari mirip", confidence: "medium" }]}
            />
        );

        expect(screen.getByText('Berdasarkan transaksi terakhirmu')).toBeDefined();
        expect(screen.getByText('Ngopi kantor 18000')).toBeDefined();
        expect(screen.getByText('Biasanya sekitar Rp18.000')).toBeDefined();
    });

    it('calls onSuggestionClick when a suggestion is clicked', () => {
        const date = new Date(2024, 0, 10, 8, 0, 0); // Normal Morning
        vi.setSystemTime(date);

        render(<DynamicSuggestions onSuggestionClick={mockOnSuggestionClick} />);
        
        const suggestionButton = screen.getByText('Sarapan bubur ayam 15rb');
        suggestionButton.click();

        expect(mockOnSuggestionClick).toHaveBeenCalledWith('Sarapan bubur ayam 15rb');
    });
});