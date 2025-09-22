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
  type?: string;
  category?: string;
}

export interface Liability extends BaseRecord {
  name: string;
  value: number;
  type?: string;
  category?: string;
}

  export interface Goal extends BaseRecord {
    name: string;
    icon?: string | null;
    targetAmount: number;
    currentAmount: number;
    targetDate?: string | null;
    notes?: string | null;
  }

export interface Transaction extends BaseRecord {
  type: TransactionType;
  amount: number;
  category: string;
  walletId: string;
  description: string;
  date: string;
  linkedDebtId?: string | null;
}

export interface UserProfile extends BaseRecord {
  isBiometricEnabled?: boolean;
  displayName?: string;
  email?: string;
  photoURL?: string;
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
export type AssetPayload = Omit<Asset, 'id'>;
export type LiabilityPayload = Omit<Liability, 'id'>;
export type AssetLiabilityInput = (AssetPayload & { type: 'asset' }) | (LiabilityPayload & { type: 'liability' });
