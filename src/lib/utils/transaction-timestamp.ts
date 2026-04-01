const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const getCurrentIsoTimestamp = () => new Date().toISOString();

export const normalizeTransactionTimestamp = (
  value?: string | Date | null
) => {
  if (!value) return getCurrentIsoTimestamp();

  if (value instanceof Date) {
    return value.toISOString();
  }

  const trimmed = value.trim();
  if (!trimmed) return getCurrentIsoTimestamp();

  if (DATE_ONLY_PATTERN.test(trimmed)) {
    const [year, month, day] = trimmed.split('-').map(Number);
    const now = new Date();
    const localDate = new Date(
      year,
      month - 1,
      day,
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    );

    return localDate.toISOString();
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? getCurrentIsoTimestamp() : parsed.toISOString();
};
