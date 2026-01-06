
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
import type { Reminder, ReminderInput, ReminderChannel, ReminderRepeatRule } from '@/types/models';

const normalizeDateInput = (value: string | Date | null | undefined): string | null => {
    if (!value) return null;
    if (typeof value === 'string') {
        return value;
    }
    return value.toISOString();
};

export const useReminders = () => {
    const { user } = useApp();
    const ui = useUI();
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getRemindersCollectionRef = useCallback(() => {
        if (!user) return null;
        return collection(db, `users/${user.uid}/reminders`);
    }, [user]);

    useEffect(() => {
        if (!user) {
            setReminders([]);
            setIsLoading(false);
            return;
        }

        const remindersCollectionRef = getRemindersCollectionRef();
        if (!remindersCollectionRef) return;

        const q = query(remindersCollectionRef, orderBy('dueDate', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const remindersData = snapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...(docSnap.data() as Omit<Reminder, 'id'>),
            })) as Reminder[];
            setReminders(remindersData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching reminders:", error);
            ui.showToast("Gagal memuat pengingat.", 'error');
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, getRemindersCollectionRef, ui]);

    const addReminder = useCallback(async (reminderData: ReminderInput) => {
        if (!user) throw new Error("User not authenticated.");
        const remindersCollection = getRemindersCollectionRef();
        if (!remindersCollection) return;

        const nowIso = new Date().toISOString();
        const dueDateValue = normalizeDateInput(reminderData.dueDate);
        const payload: ReminderInput = {
            ...reminderData,
            type: reminderData.type || 'one_time',
            targetType: reminderData.targetType || null,
            targetId: reminderData.targetId ?? null,
            amount: reminderData.amount ?? 0,
            dueDate: dueDateValue,
            repeatRule: reminderData.repeatRule || null,
            status: reminderData.status || 'upcoming',
            snoozeCount: reminderData.snoozeCount ?? 0,
            channels: reminderData.channels?.length ? reminderData.channels : ['push'],
            notes: reminderData.notes || '',
        };

        await addDoc(remindersCollection, {
            ...payload,
            createdAt: nowIso,
            updatedAt: nowIso,
            userId: user.uid,
        });
        ui.showToast("Pengingat berhasil dibuat!", 'success');
        ui.setReminderToEdit(null);
        ui.setIsReminderModalOpen(false);
    }, [user, getRemindersCollectionRef, ui]);

    const updateReminder = useCallback(async (reminderId: string, reminderData: ReminderInput) => {
        if (!user) throw new Error("User not authenticated.");
        const remindersCollection = getRemindersCollectionRef();
        if (!remindersCollection) return;

        const reminderRef = doc(remindersCollection, reminderId);
        const dueDateValue = normalizeDateInput(reminderData.dueDate);

        const payload: ReminderInput = {
            ...reminderData,
            dueDate: dueDateValue,
            amount: reminderData.amount ?? 0,
            channels: reminderData.channels?.length ? reminderData.channels : ['push'],
            targetId: reminderData.targetId ?? null,
            targetType: reminderData.targetType ?? null,
        };

        await updateDoc(reminderRef, {
            ...payload,
            updatedAt: new Date().toISOString(),
        });
        ui.showToast("Pengingat diperbarui.", 'success');
        ui.setReminderToEdit(null);
        ui.setIsReminderModalOpen(false);
    }, [user, getRemindersCollectionRef, ui]);

    const deleteReminder = useCallback(async (reminderId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const remindersCollection = getRemindersCollectionRef();
        if (!remindersCollection) return;

        const reminderRef = doc(remindersCollection, reminderId);
        await deleteDoc(reminderRef);
        ui.showToast("Pengingat dihapus.", 'info');
        ui.setReminderToEdit(null);
        ui.setIsReminderModalOpen(false);
    }, [user, getRemindersCollectionRef, ui]);

    const markReminderComplete = useCallback(async (reminderId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const remindersCollection = getRemindersCollectionRef();
        if (!remindersCollection) return;

        const reminderRef = doc(remindersCollection, reminderId);
        await updateDoc(reminderRef, {
            status: 'completed',
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        ui.showToast("Pengingat ditandai selesai.", 'success');
    }, [user, getRemindersCollectionRef, ui]);

    const snoozeReminder = useCallback(async (reminderId: string, nextDueDate: string, currentCount: number = 0) => {
        if (!user) throw new Error("User not authenticated.");
        const remindersCollection = getRemindersCollectionRef();
        if (!remindersCollection) return;

        const reminderRef = doc(remindersCollection, reminderId);
        await updateDoc(reminderRef, {
            dueDate: nextDueDate,
            status: 'snoozed',
            snoozeCount: currentCount + 1,
            updatedAt: new Date().toISOString(),
        });
        ui.showToast("Pengingat ditunda.", 'info');
    }, [user, getRemindersCollectionRef, ui]);


    return {
        reminders,
        isLoading,
        addReminder,
        updateReminder,
        deleteReminder,
        markReminderComplete,
        snoozeReminder,
    };
};
