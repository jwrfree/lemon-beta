import { z } from 'zod';

export const walletSchema = z.object({
  name: z.string().min(1, 'Nama dompet wajib diisi'),
  balance: z.string()
    .optional()
    .default('0')
    .transform((val) => {
      if (!val) return 0;
      const cleaned = val.replace(/[^0-9]/g, '');
      const number = parseInt(cleaned, 10);
      return isNaN(number) ? 0 : number;
    }),
  icon: z.string().min(1, 'Kategori dompet wajib dipilih'),
  isDefault: z.boolean().default(false),
});

export type WalletFormValues = z.infer<typeof walletSchema>;
