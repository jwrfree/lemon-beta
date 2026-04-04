import { afterEach, describe, expect, it } from 'vitest';

import { config } from '@/lib/config';

import { extractTransaction, parseSimpleTransactionInput } from './extract-transaction-flow';

const originalDeepSeekApiKey = config.ai.deepseek.apiKey;

describe('parseSimpleTransactionInput', () => {
    afterEach(() => {
        config.ai.deepseek.apiKey = originalDeepSeekApiKey;
    });

    it('parses simple expense commands with rupiah shorthand', async () => {
        const result = await parseSimpleTransactionInput('catat kopi 18rb');
        expect(result?.transactions?.[0]).toMatchObject({
            amount: 18000,
            description: 'Kopi',
            category: 'Konsumsi & F&B',
            subCategory: 'Jajanan & Kopi',
            type: 'expense',
        });
    });

    it('detects wallet names from simple capture commands', async () => {
        const result = await parseSimpleTransactionInput('catat makan 25rb pakai BCA', {
            wallets: ['Dompet', 'BCA', 'GoPay'],
        });
        expect(result?.transactions?.[0]).toMatchObject({
            amount: 25000,
            wallet: 'BCA',
            category: 'Konsumsi & F&B',
        });
    });

    it('parses bare smart-add phrases when enabled', async () => {
        const result = await parseSimpleTransactionInput('Makan malam 25rb', {
            wallets: ['Dompet', 'BCA'],
        }, {
            allowBareInput: true,
        });
        expect(result?.transactions?.[0]).toMatchObject({
            amount: 25000,
            description: 'Makan malam',
            category: 'Konsumsi & F&B',
        });
    });

    it('maps food delivery to a specific food subcategory', async () => {
        const result = await parseSimpleTransactionInput('GoFood 45rb', {
            wallets: ['Tunai', 'GoPay'],
        }, {
            allowBareInput: true,
        });
        expect(result?.transactions?.[0]).toMatchObject({
            category: 'Konsumsi & F&B',
            subCategory: 'Gofood/Grabfood',
        });
    });

    it('maps electricity bills to a utility subcategory', async () => {
        const result = await parseSimpleTransactionInput('bayar token listrik 100rb', {
            wallets: ['Tunai'],
        }, {
            allowBareInput: true,
        });
        expect(result?.transactions?.[0]).toMatchObject({
            category: 'Tagihan & Utilitas',
            subCategory: 'Listrik (Token/Tagihan)',
        });
    });

    it('maps local coffee brands to coffee snacks subcategory', async () => {
        const result = await parseSimpleTransactionInput('Kapal Api 20rb', {
            wallets: ['Tunai'],
        }, {
            allowBareInput: true,
        });
        expect(result?.transactions?.[0]).toMatchObject({
            category: 'Konsumsi & F&B',
            subCategory: 'Jajanan & Kopi',
        });
    });

    it('maps minimarket merchants to grocery subcategory', async () => {
        const result = await parseSimpleTransactionInput('Alfamart 75rb', {
            wallets: ['Tunai'],
        }, {
            allowBareInput: true,
        });
        expect(result?.transactions?.[0]).toMatchObject({
            category: 'Konsumsi & F&B',
            subCategory: 'Bahan Masakan (Grocery)',
        });
    });

    it('maps fuel station merchants to fuel subcategory', async () => {
        const result = await parseSimpleTransactionInput('Pertamina 150rb', {
            wallets: ['Tunai'],
        }, {
            allowBareInput: true,
        });
        expect(result?.transactions?.[0]).toMatchObject({
            category: 'Transportasi',
            subCategory: 'Bensin',
        });
    });

    it('maps BPJS mentions to the health utility subcategory', async () => {
        const result = await parseSimpleTransactionInput('Bayar BPJS 42rb', {
            wallets: ['Tunai'],
        }, {
            allowBareInput: true,
        });
        expect(result?.transactions?.[0]).toMatchObject({
            category: 'Tagihan & Utilitas',
            subCategory: 'BPJS Kesehatan',
        });
    });

    it('maps marketplace merchants to the marketplace lifestyle subcategory', async () => {
        const result = await parseSimpleTransactionInput('Shopee 120rb', {
            wallets: ['Tunai'],
        }, {
            allowBareInput: true,
        });
        expect(result?.transactions?.[0]).toMatchObject({
            category: 'Belanja & Lifestyle',
            subCategory: 'Marketplace (Tokped/Shopee)',
        });
    });

    it('maps game top ups to the game entertainment subcategory', async () => {
        const result = await parseSimpleTransactionInput('top up ML 50rb', {
            wallets: ['Tunai'],
        }, {
            allowBareInput: true,
        });
        expect(result?.transactions?.[0]).toMatchObject({
            category: 'Hiburan & Wisata',
            subCategory: 'Game & Top Up',
        });
    });

    it('maps PLN Mobile payments to the electricity subcategory', async () => {
        const result = await parseSimpleTransactionInput('PLN Mobile 100rb', {
            wallets: ['Tunai'],
        }, {
            allowBareInput: true,
        });
        expect(result?.transactions?.[0]).toMatchObject({
            category: 'Tagihan & Utilitas',
            subCategory: 'Listrik (Token/Tagihan)',
        });
    });

    it('maps e-wallet top ups to a generic miscellaneous subcategory for now', async () => {
        const result = await parseSimpleTransactionInput('top up GoPay 100rb', {
            wallets: ['Tunai'],
        }, {
            allowBareInput: true,
        });
        expect(result?.transactions?.[0]).toMatchObject({
            category: 'Biaya Lain-lain',
            subCategory: 'Lainnya',
        });
    });

    it('defaults to cash wallet when no wallet is mentioned', async () => {
        const result = await parseSimpleTransactionInput('Kopi 18rb', {
            wallets: ['BCA', 'Tunai', 'GoPay'],
        }, {
            allowBareInput: true,
        });
        expect(result?.transactions?.[0]?.wallet).toBe('Tunai');
    });

    it('defaults parsed transactions to a full timestamp, not date-only', async () => {
        const result = await parseSimpleTransactionInput('catat kopi 18rb');
        expect(result?.transactions?.[0]?.date).toMatch(/T\d{2}:\d{2}:\d{2}/);
    });

    it('asks for clarification when no amount is present', async () => {
        const result = await parseSimpleTransactionInput('catat makan');
        expect(result?.clarificationQuestion).toContain('Nominalnya belum kebaca');
    });

    it('auto-capitalizes known acronyms and brands even in lowercase input', async () => {
        const result = await parseSimpleTransactionInput('bayar listrik pln pakai bca 500rb', {
            wallets: ['BCA'],
        }, {
            allowBareInput: true,
        });
        expect(result?.transactions?.[0]).toMatchObject({
            amount: 500000,
            description: 'Listrik PLN',
            wallet: 'BCA',
        });
    });

    it('throws a descriptive error when DeepSeek is unavailable for extraction', async () => {
        config.ai.deepseek.apiKey = undefined;

        await expect(extractTransaction('catat kopi 18rb', {
            wallets: ['Tunai'],
            categories: ['Konsumsi & F&B'],
        })).rejects.toThrow('DeepSeek API key not found. Smart Add tidak tersedia.');
    });
});
