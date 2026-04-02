import { describe, expect, it, vi } from 'vitest';
import type { TransactionRow } from '@/types/models';
import {
  createTransactionWithClient,
  deleteTransactionWithClient,
  mapTransactionRowToUnifiedValues,
  updateTransactionWithClient,
} from './transaction.service';

describe('transaction.service shared helpers', () => {
  it('maps a transaction row into unified transaction values', () => {
    const row: TransactionRow = {
      id: 'tx-1',
      amount: 25000,
      category: 'Makan',
      sub_category: 'Siang',
      date: '2026-04-02T10:00:00.000Z',
      description: 'Nasi Padang',
      type: 'expense',
      location: 'Jakarta',
      wallet_id: 'wallet-1',
      is_need: true,
      user_id: 'user-1',
      created_at: '2026-04-02T10:00:00.000Z',
      updated_at: '2026-04-02T10:00:00.000Z',
    };

    const mapped = mapTransactionRowToUnifiedValues(row);

    expect(mapped).toMatchObject({
      type: 'expense',
      amount: 25000,
      category: 'Makan',
      subCategory: 'Siang',
      description: 'Nasi Padang',
      walletId: 'wallet-1',
      location: 'Jakarta',
      isNeed: true,
    });
    expect(mapped.date.toISOString()).toBe('2026-04-02T10:00:00.000Z');
  });

  it('creates transactions through the atomic RPC contract', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { id: 'tx-1' }, error: null });
    const client = { rpc, from: vi.fn() };

    const result = await createTransactionWithClient(client as any, 'user-1', {
      type: 'expense',
      amount: 50000,
      category: 'Transport',
      subCategory: 'Ojol',
      date: new Date('2026-04-02T10:00:00.000Z'),
      description: 'Pergi meeting',
      walletId: 'wallet-1',
      location: '',
      isNeed: true,
    });

    expect(result).toEqual({ data: 'tx-1', error: null });
    expect(rpc).toHaveBeenCalledWith('create_transaction_v1', {
      p_user_id: 'user-1',
      p_wallet_id: 'wallet-1',
      p_amount: 50000,
      p_category: 'Transport',
      p_sub_category: 'Ojol',
      p_date: '2026-04-02T10:00:00.000Z',
      p_description: 'Pergi meeting',
      p_type: 'expense',
      p_is_need: true,
    });
  });

  it('updates and deletes transactions through atomic RPCs', async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: null });
    const client = { rpc, from: vi.fn() };

    const updateResult = await updateTransactionWithClient(client as any, 'user-1', 'tx-1', {
      type: 'income',
      amount: 100000,
      category: 'Gaji',
      subCategory: '',
      date: new Date('2026-04-02T12:00:00.000Z'),
      description: 'Bonus',
      walletId: 'wallet-2',
      location: '',
      isNeed: true,
    });

    const deleteResult = await deleteTransactionWithClient(client as any, 'user-1', 'tx-1');

    expect(updateResult).toEqual({ data: true, error: null });
    expect(deleteResult).toEqual({ data: true, error: null });
    expect(rpc).toHaveBeenNthCalledWith(1, 'update_transaction_v1', {
      p_user_id: 'user-1',
      p_transaction_id: 'tx-1',
      p_new_amount: 100000,
      p_new_category: 'Gaji',
      p_new_sub_category: null,
      p_new_date: '2026-04-02T12:00:00.000Z',
      p_new_description: 'Bonus',
      p_new_type: 'income',
      p_new_wallet_id: 'wallet-2',
      p_new_is_need: true,
    });
    expect(rpc).toHaveBeenNthCalledWith(2, 'delete_transaction_v1', {
      p_transaction_id: 'tx-1',
      p_user_id: 'user-1',
    });
  });
});
