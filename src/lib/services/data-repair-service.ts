import type { Transaction } from '@/types/models';

class DataRepairService {
    private transactions: Transaction[];

    constructor(transactions: Transaction[]) {
        this.transactions = transactions;
    }

    identifyMissingSubCategories(): Transaction[] {
        const missingSubCategories: Transaction[] = [];
        this.transactions.forEach(transaction => {
            if (!transaction.subCategory) {
                missingSubCategories.push(transaction);
            }
        });
        return missingSubCategories;
    }

    repairTransactions(): Transaction[] {
        const repairedTransactions = this.transactions.map(transaction => {
            if (!transaction.subCategory) {
                transaction.subCategory = this.assignDefaultSubCategory(transaction);
            }
            return transaction;
        });
        return repairedTransactions;
    }

    assignDefaultSubCategory(transaction: Transaction): string {
        // TODO: use transaction.category to determine the appropriate default sub-category
        void transaction;
        return 'Default Sub-Category';
    }
}

export default DataRepairService;