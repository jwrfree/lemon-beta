import { EventEmitter } from 'events';
import type { Transaction } from '@/types/models';

type TransactionEvents = {
    'transaction.created': (transaction: Transaction) => void;
    'transaction.updated': (transaction: Transaction) => void;
    'transaction.deleted': (transactionId: string) => void;
};

class TypedEventEmitter extends EventEmitter {
    emit<K extends keyof TransactionEvents>(event: K, ...args: Parameters<TransactionEvents[K]>): boolean {
        return super.emit(event, ...args);
    }

    on<K extends keyof TransactionEvents>(event: K, listener: TransactionEvents[K]): this {
        return super.on(event, listener);
    }

    off<K extends keyof TransactionEvents>(event: K, listener: TransactionEvents[K]): this {
        return super.off(event, listener);
    }
}

export const transactionEvents = new TypedEventEmitter();
