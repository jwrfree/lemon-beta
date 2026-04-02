export const getCurrentDate = () => new Date();

export const getStartOfMonthDate = (referenceDate: Date = getCurrentDate()) => {
    const start = new Date(referenceDate);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return start;
};

export const getPreviousMonthStartDate = (referenceDate: Date = getCurrentDate()) => {
    const start = getStartOfMonthDate(referenceDate);
    start.setMonth(start.getMonth() - 1);
    return start;
};
