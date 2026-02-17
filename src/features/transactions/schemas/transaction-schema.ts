import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.string()
    .min(1, { message: 'Jumlah wajib diisi' })
    .transform((val) => {
      const cleaned = val.replace(/[^0-9]/g, '');
      const number = parseInt(cleaned, 10);
      return isNaN(number) ? 0 : number;
    })
    .refine((val) => val > 0, { message: 'Jumlah harus lebih dari 0' }),
  category: z.string().min(1, { message: 'Kategori wajib diisi' }),
  subCategory: z.string().optional(),
  walletId: z.string().min(1, { message: 'Dompet wajib dipilih' }),
  description: z.string().min(1, { message: 'Deskripsi wajib diisi' }),
  location: z.string().optional(),
  date: z.date({ required_error: 'Tanggal wajib diisi' }),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

export const transferSchema = z.object({
  fromWalletId: z.string().min(1, { message: 'Dompet asal wajib dipilih' }),
  toWalletId: z.string().min(1, { message: 'Dompet tujuan wajib dipilih' }),
  amount: z.string()
    .min(1, { message: 'Jumlah wajib diisi' })
    .transform((val) => {
      const cleaned = val.replace(/[^0-9]/g, '');
      const number = parseInt(cleaned, 10);
      return isNaN(number) ? 0 : number;
    })
    .refine((val) => val > 0, { message: 'Jumlah harus lebih dari 0' }),
  description: z.string().min(1, { message: 'Deskripsi wajib diisi' }),
  date: z.date({ required_error: 'Tanggal wajib diisi' }),
}).refine((data) => data.fromWalletId !== data.toWalletId, {
  message: "Dompet asal dan tujuan tidak boleh sama",
  path: ["toWalletId"],
});

export type TransferFormValues = z.infer<typeof transferSchema>;

// Unified Schema for Transaction Composer
const baseSchema = z.object({
  amount: z.string()
    .min(1, { message: 'Jumlah wajib diisi' })
    .transform((val) => {
      const cleaned = val.replace(/[^0-9]/g, '');
      const number = parseInt(cleaned, 10);
      return isNaN(number) ? 0 : number;
    })
    .refine((val) => val > 0, { message: 'Jumlah harus lebih dari 0' }),
  description: z.string().min(1, { message: 'Deskripsi wajib diisi' }),
  date: z.date({ required_error: 'Tanggal wajib diisi' }),
});

const expenseIncomeBase = baseSchema.extend({
  type: z.enum(['expense', 'income']),
  category: z.string().min(1, { message: 'Kategori wajib diisi' }),
  subCategory: z.string().optional(),
  walletId: z.string().min(1, { message: 'Dompet wajib dipilih' }),
  location: z.string().optional(),
  isNeed: z.boolean().default(true).optional(),
});

const transferBase = baseSchema.extend({
  type: z.literal('transfer'),
  fromWalletId: z.string().min(1, { message: 'Dompet asal wajib dipilih' }),
  toWalletId: z.string().min(1, { message: 'Dompet tujuan wajib dipilih' }),
});

export const unifiedTransactionSchema = z.discriminatedUnion('type', [
  expenseIncomeBase,
  transferBase,
]).refine((data) => {
  if (data.type === 'transfer') {
    return data.fromWalletId !== data.toWalletId;
  }
  return true;
}, {
  message: "Dompet asal dan tujuan tidak boleh sama",
  path: ["toWalletId"],
});

export type UnifiedTransactionFormValues = z.infer<typeof unifiedTransactionSchema>;
