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
