
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    doc,
    onSnapshot,
    addDoc,
    updateDoc,
    query,
    orderBy,
    deleteDoc,
    type CollectionReference,
    type DocumentData,
} from 'firebase/firestore';
import { useApp } from '@/components/app-provider';
import { useUI } from '@/components/ui-provider';
import { db } from '@/lib/firebase';
import type { Asset, Liability, AssetLiabilityInput } from '@/types/models';

export const useAssetsLiabilities = () => {
    const { user } = useApp();
    const { showToast } = useUI();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [liabilities, setLiabilities] = useState<Liability[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getCollectionRef = useCallback((collectionName: string) => {
        if (!user) return null;
        return collection(db, `users/${user.uid}/${collectionName}`);
    }, [user]);

    useEffect(() => {
        if (!user) {
            setAssets([]);
            setLiabilities([]);
            setIsLoading(false);
            return;
        }

        const subscribeToCollection = <T extends { id: string }>(
            ref: CollectionReference<DocumentData> | null,
            setter: React.Dispatch<React.SetStateAction<T[]>>
        ) => {
            if (!ref) return () => {};
            const q = query(ref, orderBy('createdAt', 'desc'));
            return onSnapshot(q, (snapshot) => {
                const items = snapshot.docs.map(docSnap => ({
                    id: docSnap.id,
                    ...(docSnap.data() as Omit<T, 'id'>),
                })) as T[];
                setter(items);
                setIsLoading(false);
            }, (error) => {
                console.error(`Error fetching collection:`, error);
                setIsLoading(false);
            });
        };
        
        const unsubAssets = subscribeToCollection<Asset>(getCollectionRef('assets'), setAssets);
        const unsubLiabilities = subscribeToCollection<Liability>(getCollectionRef('liabilities'), setLiabilities);

        return () => {
            unsubAssets();
            unsubLiabilities();
        };

    }, [user, getCollectionRef]);

    const addAssetLiability = useCallback(async (data: AssetLiabilityInput) => {
        if (!user) throw new Error("User not authenticated.");
        const { type, ...itemData } = data;
        const collectionRef = getCollectionRef(type === 'asset' ? 'assets' : 'liabilities');
        if (!collectionRef) return;

        await addDoc(collectionRef, {
            ...itemData,
            createdAt: new Date().toISOString(),
            userId: user.uid
        });

        showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil ditambahkan!`, 'success');
    }, [user, getCollectionRef, showToast]);

    const updateAssetLiability = useCallback(async (id: string, type: 'asset' | 'liability', data: Partial<Asset> | Partial<Liability>) => {
        if (!user) throw new Error("User not authenticated.");
        const collectionRef = getCollectionRef(type === 'asset' ? 'assets' : 'liabilities');
        if (!collectionRef) return;

        const docRef = doc(collectionRef, id);
        await updateDoc(docRef, data);
        showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil diperbarui!`, 'success');
    }, [user, getCollectionRef, showToast]);

    const deleteAssetLiability = useCallback(async (id: string, type: 'asset' | 'liability') => {
        if (!user) throw new Error("User not authenticated.");
        const collectionRef = getCollectionRef(type === 'asset' ? 'assets' : 'liabilities');
        if (!collectionRef) return;
        
        const docRef = doc(collectionRef, id);
        await deleteDoc(docRef);
        showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil dihapus.`, 'success');
    }, [user, getCollectionRef, showToast]);


    return {
        assets,
        liabilities,
        isLoading,
        addAssetLiability,
        updateAssetLiability,
        deleteAssetLiability
    };
};
