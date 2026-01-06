
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    type CollectionReference,
    type DocumentData,
    type OrderByDirection,
} from 'firebase/firestore';
import { useApp } from '@/components/app-provider';
import { db } from '@/lib/firebase';
import { categories } from '@/lib/categories';
import type {
    Wallet,
    Transaction,
} from '@/types/models';


export const useData = () => {
    const { user } = useApp();

    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getCollectionRef = useCallback((collectionName: string) => {
        if (!user) return null;
        return collection(db, `users/${user.uid}/${collectionName}`);
    }, [user]);

     useEffect(() => {
        if (!user) {
            setWallets([]);
            setTransactions([]);
            setIsLoading(false);
            return;
        }

        type CollectionConfig<T> = {
            setter: React.Dispatch<React.SetStateAction<T[]>>;
            ref: CollectionReference<DocumentData> | null;
            orderByField?: string;
            orderDirection?: OrderByDirection;
            logName: string;
        };

        const subscribeToCollection = <T extends { id: string }>(config: CollectionConfig<T>) => {
            const {
                setter,
                ref,
                orderByField = 'createdAt',
                orderDirection = 'desc',
                logName,
            } = config;

            if (!ref) {
                return () => undefined;
            }

            const q = query(ref, orderBy(orderByField, orderDirection));
            return onSnapshot(
                q,
                snapshot => {
                    const items = snapshot.docs.map(docSnap => ({
                        id: docSnap.id,
                        ...(docSnap.data() as Record<string, unknown>),
                    }) as T);
                    setter(items);
                    setIsLoading(false);
                },
                error => {
                    console.error(`Error fetching ${logName}:`, error);
                    setIsLoading(false);
                }
            );
        };

        const unsubscribers = [
            subscribeToCollection<Wallet>({
                setter: setWallets,
                ref: getCollectionRef('wallets'),
                orderByField: 'createdAt',
                orderDirection: 'desc',
                logName: 'wallets',
            }),
            subscribeToCollection<Transaction>({
                setter: setTransactions,
                ref: getCollectionRef('transactions'),
                orderByField: 'date',
                orderDirection: 'desc',
                logName: 'transactions',
            }),
        ].filter((unsubscribe): unsubscribe is () => void => Boolean(unsubscribe));

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [user, getCollectionRef]);

    return {
        wallets,
        transactions,
        expenseCategories: categories.expense,
        incomeCategories: categories.income,
        isLoading,
    };
};
