const DELETE_CONFIRMATION_TTL_MS = 10 * 60_000;

type PendingDeleteConfirmation = {
  transactionId: string;
  createdAt: number;
  expiresAt: number;
};

const pendingDeleteConfirmations = new Map<string, PendingDeleteConfirmation>();

const getValidPendingConfirmation = (userId: string) => {
  const pending = pendingDeleteConfirmations.get(userId);
  if (!pending) return null;

  if (pending.expiresAt <= Date.now()) {
    pendingDeleteConfirmations.delete(userId);
    return null;
  }

  return pending;
};

export const stagePendingDeleteConfirmation = (userId: string, transactionId: string) => {
  const now = Date.now();
  pendingDeleteConfirmations.set(userId, {
    transactionId,
    createdAt: now,
    expiresAt: now + DELETE_CONFIRMATION_TTL_MS,
  });
};

export const getPendingDeleteConfirmation = (userId: string) =>
  getValidPendingConfirmation(userId);

export const clearPendingDeleteConfirmation = (userId: string) => {
  pendingDeleteConfirmations.delete(userId);
};

export const resetPendingDeleteConfirmationsForTest = () => {
  pendingDeleteConfirmations.clear();
};
