import { describe, it, expect, vi, beforeEach } from 'vitest';
import { debtSchema, debtPaymentSchema } from '../schemas/debt-schema';

describe('debtSchema', () => {
  describe('valid input', () => {
    it('should accept a minimal valid debt', () => {
      const result = debtSchema.safeParse({
        title: 'Cicilan Laptop',
        counterparty: 'Bank BCA',
        principal: '10.000.000',
      });
      expect(result.success).toBe(true);
    });

    it('should default direction to owed when not provided', () => {
      const result = debtSchema.safeParse({
        title: 'Test',
        counterparty: 'Someone',
        principal: '100.000',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.direction).toBe('owed');
      }
    });

    it('should default category to personal when not provided', () => {
      const result = debtSchema.safeParse({
        title: 'Test',
        counterparty: 'Someone',
        principal: '100.000',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.category).toBe('personal');
      }
    });

    it('should default paymentFrequency to monthly', () => {
      const result = debtSchema.safeParse({
        title: 'Test',
        counterparty: 'Someone',
        principal: '100.000',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.paymentFrequency).toBe('monthly');
      }
    });

    it('should accept owing direction', () => {
      const result = debtSchema.safeParse({
        title: 'Piutang Teman',
        direction: 'owing',
        counterparty: 'Budi',
        principal: '500.000',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.direction).toBe('owing');
      }
    });

    it('should accept all frequency values', () => {
      const frequencies = ['one_time', 'weekly', 'biweekly', 'monthly', 'custom'] as const;
      for (const freq of frequencies) {
        const result = debtSchema.safeParse({
          title: 'Test',
          counterparty: 'Someone',
          principal: '100.000',
          paymentFrequency: freq,
        });
        expect(result.success).toBe(true);
      }
    });

    it('should accept optional fields as null or undefined', () => {
      const result = debtSchema.safeParse({
        title: 'Test',
        direction: 'owed',
        counterparty: 'Someone',
        principal: '100.000',
        interestRate: null,
        dueDate: null,
        nextPaymentDate: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid input', () => {
    it('should reject empty title', () => {
      const result = debtSchema.safeParse({
        title: '',
        counterparty: 'Bank',
        principal: '100.000',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Nama hutang/piutang wajib diisi');
      }
    });

    it('should reject empty counterparty', () => {
      const result = debtSchema.safeParse({
        title: 'Test',
        counterparty: '',
        principal: '100.000',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Pihak terkait wajib diisi');
      }
    });

    it('should reject empty principal', () => {
      const result = debtSchema.safeParse({
        title: 'Test',
        counterparty: 'Bank',
        principal: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Nominal utama wajib diisi');
      }
    });

    it('should reject invalid direction value', () => {
      const result = debtSchema.safeParse({
        title: 'Test',
        direction: 'invalid',
        counterparty: 'Bank',
        principal: '100.000',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid paymentFrequency value', () => {
      const result = debtSchema.safeParse({
        title: 'Test',
        counterparty: 'Bank',
        principal: '100.000',
        paymentFrequency: 'annually',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('debtPaymentSchema', () => {
  const fixedDate = new Date('2026-02-24T10:00:00.000Z');

  describe('valid input', () => {
    it('should accept a valid payment', () => {
      const result = debtPaymentSchema.safeParse({
        amount: '500.000',
        paymentDate: fixedDate,
        walletId: 'wallet-uuid-123',
      });
      expect(result.success).toBe(true);
    });

    it('should accept optional notes and nextPaymentDate', () => {
      const result = debtPaymentSchema.safeParse({
        amount: '100.000',
        paymentDate: fixedDate,
        walletId: 'wallet-uuid-123',
        notes: 'Transfer via BCA',
        nextPaymentDate: fixedDate,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid input', () => {
    it('should reject empty amount', () => {
      const result = debtPaymentSchema.safeParse({
        amount: '',
        paymentDate: fixedDate,
        walletId: 'wallet-uuid-123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Nominal pembayaran wajib diisi');
      }
    });

    it('should reject missing paymentDate', () => {
      const result = debtPaymentSchema.safeParse({
        amount: '100.000',
        walletId: 'wallet-uuid-123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty walletId', () => {
      const result = debtPaymentSchema.safeParse({
        amount: '100.000',
        paymentDate: fixedDate,
        walletId: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Dompet wajib dipilih');
      }
    });
  });
});
