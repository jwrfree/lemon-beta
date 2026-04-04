import { z } from 'zod';

export const reminderSchema = z.object({
  title: z.string().min(1, 'Judul pengingat wajib diisi.'),
  type: z.enum(['one_time', 'recurring', 'debt']),
  amount: z.string().optional(),
  dueDate: z.date({
    required_error: 'Tanggal jatuh tempo wajib dipilih.',
    invalid_type_error: 'Pilih tanggal yang valid.',
  }),
  repeatFrequency: z.enum(['none', 'daily', 'weekly', 'monthly', 'custom']),
  customInterval: z.string().optional().refine(val => {
    if (!val) return true;
    const n = parseInt(val);
    return !isNaN(n) && n > 0;
  }, {
    message: 'Interval harian harus berupa angka positif.'
  }),
  notes: z.string().optional(),
  channels: z.array(z.string()).min(1, 'Pilih setidaknya satu kanal pengingat.'),
  linkedDebtId: z.string().optional(),
});

export type ReminderFormValues = z.infer<typeof reminderSchema>;
