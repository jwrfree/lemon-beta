import { z } from 'zod';
import { PaymentFrequency, DebtStatus, DebtDirection } from '@/types/models';

export const debtSchema = z.object({
  title: z.string().min(1, 'Nama hutang/piutang wajib diisi'),
  direction: z.enum(['owed', 'owing'] as const).default('owed'),
  counterparty: z.string().min(1, 'Pihak terkait wajib diisi'),
  category: z.string().optional().default('personal'),
  principal: z.string().min(1, 'Nominal utama wajib diisi'),
  outstandingBalance: z.string().optional(),
  interestRate: z.string().optional().nullable(),
  paymentFrequency: z.enum(['one_time', 'weekly', 'biweekly', 'monthly', 'custom'] as const).default('monthly'),
  customInterval: z.string().optional().nullable(),
  startDate: z.date().optional(),
  dueDate: z.date().optional().nullable(),
  nextPaymentDate: z.date().optional().nullable(),
  notes: z.string().optional(),
});

export type DebtFormValues = z.infer<typeof debtSchema>;

export const debtPaymentSchema = z.object({
  amount: z.string().min(1, 'Nominal pembayaran wajib diisi'),
  paymentDate: z.date({
    required_error: "Tanggal pembayaran wajib diisi",
  }),
  walletId: z.string().min(1, 'Dompet wajib dipilih'),
  notes: z.string().optional(),
  nextPaymentDate: z.date().optional().nullable(),
});

export type DebtPaymentFormValues = z.infer<typeof debtPaymentSchema>;
