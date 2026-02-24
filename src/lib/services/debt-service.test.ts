import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mapDebtFromDb, mapDebtPaymentFromDb } from './debt-service';
import type { DebtRow, DebtPaymentRow } from '@/types/models';

// Mock supabase client so imports don't fail
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
}));

describe('mapDebtPaymentFromDb', () => {
  it('should map a DebtPaymentRow to a DebtPayment correctly', () => {
    const row: DebtPaymentRow = {
      id: 'payment-1',
      debt_id: 'debt-1',
      user_id: 'user-1',
      amount: 500000,
      payment_date: '2026-02-01T00:00:00Z',
      wallet_id: 'wallet-1',
      method: 'manual',
      notes: 'Transfer BCA',
      created_at: '2026-02-01T00:00:00Z',
    };

    const payment = mapDebtPaymentFromDb(row);

    expect(payment.id).toBe('payment-1');
    expect(payment.amount).toBe(500000);
    expect(payment.paymentDate).toBe('2026-02-01T00:00:00Z');
    expect(payment.walletId).toBe('wallet-1');
    expect(payment.method).toBe('manual');
    expect(payment.notes).toBe('Transfer BCA');
    expect(payment.createdAt).toBe('2026-02-01T00:00:00Z');
  });
});

describe('mapDebtFromDb', () => {
  const baseRow: DebtRow = {
    id: 'debt-1',
    title: 'Cicilan Laptop',
    counterparty: 'Bank BCA',
    principal: 10000000,
    outstanding_balance: 8000000,
    status: 'active',
    due_date: '2026-12-31T00:00:00Z',
    start_date: '2026-01-01T00:00:00Z',
    notes: 'Cicilan 24 bulan',
    direction: 'owed',
    category: 'personal',
    interest_rate: 5.5,
    payment_frequency: 'monthly',
    custom_interval: null,
    next_payment_date: '2026-03-01T00:00:00Z',
    user_id: 'user-1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
  };

  it('should map a DebtRow to a Debt correctly', () => {
    const debt = mapDebtFromDb(baseRow);

    expect(debt.id).toBe('debt-1');
    expect(debt.title).toBe('Cicilan Laptop');
    expect(debt.counterparty).toBe('Bank BCA');
    expect(debt.principal).toBe(10000000);
    expect(debt.outstandingBalance).toBe(8000000);
    expect(debt.status).toBe('active');
    expect(debt.direction).toBe('owed');
    expect(debt.category).toBe('personal');
    expect(debt.interestRate).toBe(5.5);
    expect(debt.paymentFrequency).toBe('monthly');
    expect(debt.customInterval).toBeNull();
    expect(debt.dueDate).toBe('2026-12-31T00:00:00Z');
    expect(debt.startDate).toBe('2026-01-01T00:00:00Z');
    expect(debt.nextPaymentDate).toBe('2026-03-01T00:00:00Z');
    expect(debt.notes).toBe('Cicilan 24 bulan');
    expect(debt.userId).toBe('user-1');
    expect(debt.createdAt).toBe('2026-01-01T00:00:00Z');
    expect(debt.updatedAt).toBe('2026-02-01T00:00:00Z');
  });

  it('should map direction "owed" correctly (saya berhutang)', () => {
    const debt = mapDebtFromDb({ ...baseRow, direction: 'owed' });
    expect(debt.direction).toBe('owed');
  });

  it('should map direction "owing" correctly (orang lain berhutang)', () => {
    const debt = mapDebtFromDb({ ...baseRow, direction: 'owing' });
    expect(debt.direction).toBe('owing');
  });

  it('should map empty payments array when payments is not present', () => {
    const debt = mapDebtFromDb(baseRow);
    expect(debt.payments).toEqual([]);
  });

  it('should map payments array when present', () => {
    const rowWithPayments = {
      ...baseRow,
      payments: [
        {
          id: 'payment-1',
          debt_id: 'debt-1',
          user_id: 'user-1',
          amount: 500000,
          payment_date: '2026-02-01T00:00:00Z',
          wallet_id: 'wallet-1',
          method: 'manual',
          notes: null,
          created_at: '2026-02-01T00:00:00Z',
        },
      ],
    };

    const debt = mapDebtFromDb(rowWithPayments);
    expect(debt.payments).toHaveLength(1);
    expect(debt.payments?.[0].amount).toBe(500000);
  });

  it('should handle null optional fields gracefully', () => {
    const rowWithNulls = {
      ...baseRow,
      due_date: null,
      start_date: null,
      next_payment_date: null,
      interest_rate: null,
      custom_interval: null,
    };

    const debt = mapDebtFromDb(rowWithNulls);
    expect(debt.dueDate).toBeNull();
    expect(debt.startDate).toBeNull();
    expect(debt.nextPaymentDate).toBeNull();
    expect(debt.interestRate).toBeNull();
    expect(debt.customInterval).toBeNull();
  });

  it('should correctly map "outstanding_balance" from DB to "outstandingBalance" in model', () => {
    const debt = mapDebtFromDb({ ...baseRow, outstanding_balance: 3500000 });
    expect(debt.outstandingBalance).toBe(3500000);
  });

  it('should correctly map "payment_frequency" from DB to "paymentFrequency" in model', () => {
    const debt = mapDebtFromDb({ ...baseRow, payment_frequency: 'weekly' });
    expect(debt.paymentFrequency).toBe('weekly');
  });
});
