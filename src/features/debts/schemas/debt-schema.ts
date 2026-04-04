import { z } from 'zod';
import { PaymentFrequency, DebtStatus, DebtDirection } from '@/types/models';

export const debtSchema = z.object({
  title: z.string().min(1, 'Nama hutang/piutang wajib diisi'),
  direction: z.enum(['owed', 'owing'] as const).default('owed'),
  counterparty: z.string().min(1, 'Pihak terkait wajib diisi'),
  category: z.string().optional().default('personal'),
  principal: z.string().min(1, 'Nominal utama wajib diisi').refine((val) => {
    const num = parseInt(val.replace(/[^0-9]/g, ''));
    return num > 0;
  }, 'Nominal harus lebih besar dari 0'),
  outstandingBalance: z.string().optional(),
  interestRate: z.string().optional().nullable(),
  paymentFrequency: z.enum(['one_time', 'weekly', 'biweekly', 'monthly', 'custom'] as const).default('monthly'),
  customInterval: z.string().optional().nullable(),
  startDate: z.date().optional(),
  dueDate: z.date().optional().nullable(),
  nextPaymentDate: z.date().optional().nullable(),
  notes: z.string().optional(),
  // New fields for initial recording
  recordToWallet: z.boolean().default(false),
  walletId: z.string().optional(),
}).superRefine((data, ctx) => {
  const principal = parseInt(data.principal.replace(/[^0-9]/g, '')) || 0;
  const outstanding = data.outstandingBalance 
    ? parseInt(data.outstandingBalance.replace(/[^0-9]/g, '')) || 0 
    : principal;

  if (outstanding > principal) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Sisa saldo tidak boleh melebihi nominal awal',
      path: ['outstandingBalance'],
    });
  }

  if (data.recordToWallet && !data.walletId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Dompet wajib dipilih jika ingin mencatat ke saldo',
      path: ['walletId'],
    });
  }
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
