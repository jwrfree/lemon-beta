
export interface BaseRecord {
  id: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TransactionType = 'income' | 'expense';

export type ReminderType = 'one_time' | 'recurring' | 'debt';
export type ReminderStatus = 'upcoming' | 'completed' | 'snoozed';
export type ReminderChannel = 'push' | 'email' | string;

export interface ReminderRepeatRule {
  frequency: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  customInterval?: number | null;
}

export interface Reminder extends BaseRecord {
  title: string;
  type: ReminderType;
  category?: string;
  targetType?: 'debt' | 'standalone' | null;
  targetId?: string | null;
  amount?: number | null;
  dueDate?: string | null;
  repeatRule?: ReminderRepeatRule | null;
  status: ReminderStatus;
  snoozeCount?: number;
  channels?: ReminderChannel[];
  notes?: string;
  completedAt?: string;
}

export type DebtDirection = 'owed' | 'owing';
export type DebtStatus = 'active' | 'settled' | 'overdue';
export type PaymentFrequency = 'one_time' | 'weekly' | 'biweekly' | 'monthly' | 'custom';

export interface DebtPayment {
  id: string;
  amount: number;
  paymentDate?: string | null;
  walletId?: string | null;
  method?: string | null;
  notes?: string | null;
  createdAt?: string;
}

export interface Debt extends BaseRecord {
  title: string;
  direction: DebtDirection;
  counterparty: string;
  category?: string;
  principal: number;
  outstandingBalance: number;
  interestRate?: number | null;
  paymentFrequency?: PaymentFrequency;
  customInterval?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
  nextPaymentDate?: string | null;
  notes?: string;
  status: DebtStatus;
  payments?: DebtPayment[];
}

export interface Wallet extends BaseRecord {
  name: string;
  balance: number;
  icon?: string | null;
  color?: string | null;
  type?: string | null;
  isDefault?: boolean;
}

  export interface Budget extends BaseRecord {
    name: string;
    targetAmount: number;
    categories: string[];
    spent?: number;
    period?: string;
    startDate?: string | null;
    endDate?: string | null;
  }

export interface Asset extends BaseRecord {
  name: string;
  value: number;
  categoryKey: string;
  notes?: string;
}

export interface Liability extends BaseRecord {
  name: string;
  value: number;
  categoryKey: string;
  notes?: string;
}

  export interface Goal extends BaseRecord {
    name: string;
    icon?: string | null;
    targetAmount: number;
    currentAmount: number;
    targetDate?: string;
    notes?: string | null;
  }

export interface Transaction extends BaseRecord {
  type: TransactionType;
  amount: number;
  category: string;
  subCategory?: string;
  walletId: string;
  description: string;
  location?: string;
  date: string;
  linkedDebtId?: string | null;
  tags?: string[];
}

export interface UserProfile extends BaseRecord {
  isBiometricEnabled?: boolean;
  displayName?: string;
  email?: string;
  photoURL?: string;
}

// Database Row Types (Raw from Supabase)
export interface WalletRow {
  id: string;
  name: string;
  balance: number;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  user_id: string;
  created_at: string;
}

export interface TransactionRow {
  id: string;
  amount: number;
  category: string;
  sub_category?: string | null;
  date: string;
  description: string;
  type: TransactionType;
  location?: string | null;
  wallet_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface DebtRow {
  id: string;
  title: string;
  counterparty: string;
  principal: number;
  outstanding_balance: number;
  status: DebtStatus;
  due_date: string | null;
  start_date: string | null;
  notes: string;
  direction: DebtDirection;
  category: string;
  interest_rate: number | null;
  payment_frequency: PaymentFrequency;
  custom_interval: number | null;
  next_payment_date: string | null;
  payments: DebtPayment[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface AssetRow {
  id: string;
  name: string;
  value: number;
  notes: string | null;
  category: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface LiabilityRow {
  id: string;
  name: string;
  value: number;
  notes: string | null;
  category: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetRow {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category: string;
  period: string;
  user_id: string;
  created_at: string;
}

export interface GoalRow {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  icon: string | null;
  user_id: string;
  created_at: string;
}

export interface ReminderRow {
  id: string;
  title: string;
  amount: number;
  due_date: string | null;
  type: ReminderType;
  category: string;
  notes: string;
  status: ReminderStatus;
  repeat_rule: ReminderRepeatRule | null;
  snooze_count: number;
  completed_at: string | null;
  channels: ReminderChannel[];
  target_id: string | null;
  target_type: 'debt' | 'standalone' | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type ReminderInput = Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'> & {
  dueDate?: string | Date | null;
  channels?: ReminderChannel[];
  repeatRule?: ReminderRepeatRule | null;
  snoozeCount?: number;
};

export type DebtInput = Omit<Debt, 'id' | 'createdAt' | 'updatedAt' | 'payments'> & {
  payments?: DebtPayment[];
  startDate?: string | Date | null;
  dueDate?: string | Date | null;
  nextPaymentDate?: string | Date | null;
};

export interface DebtPaymentInput extends Omit<DebtPayment, 'id' | 'createdAt'> {
  nextPaymentDate?: string | null;
}

export type TransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

export type TransactionUpdate = TransactionInput;

export type WalletInput = Omit<Wallet, 'id'>;
export type BudgetInput = Omit<Budget, 'id'>;
export type GoalInput = Omit<Goal, 'id'>;
export type AssetPayload = Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>;
export type LiabilityPayload = Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>;
export type AssetLiabilityInput = (AssetPayload & { type: 'asset' }) | (LiabilityPayload & { type: 'liability' });
