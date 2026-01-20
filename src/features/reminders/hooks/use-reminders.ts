'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/providers/app-provider';
import { useUI } from '@/components/ui-provider';
import { createClient } from '@/lib/supabase/client';
import { normalizeDateInput } from '@/lib/utils';
import type { Reminder, ReminderInput, ReminderRow } from '@/types/models';

const mapReminderFromDb = (r: ReminderRow): Reminder => ({
    id: r.id,
    title: r.title,
    amount: r.amount,
    dueDate: r.due_date,
    type: r.type,
    category: r.category,
    notes: r.notes,
    status: r.status,
    repeatRule: r.repeat_rule,
    snoozeCount: r.snooze_count,
    completedAt: r.completed_at ?? undefined,
    channels: r.channels || ['push'],
    targetId: r.target_id,
    targetType: r.target_type,
    userId: r.user_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at
});

export const useReminders = () => {
    const { user } = useApp();
    const ui = useUI();
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchReminders = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('reminders')
            .select('*')
            .eq('user_id', user.id)
            .order('due_date', { ascending: true });
        
        if (error) {
            console.error("Error fetching reminders:", error);
            ui.showToast("Gagal memuat pengingat.", 'error');
            setIsLoading(false);
            return;
        }

        if (data) {
            setReminders(data.map(mapReminderFromDb));
        }
        setIsLoading(false);
    }, [user, supabase, ui]);

    useEffect(() => {
        if (!user) {
            setReminders([]);
            setIsLoading(false);
            return;
        }
        fetchReminders();

        const channel = supabase
            .channel('reminders-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'reminders',
                    filter: `user_id=eq.${user.id}`,
                },
                () => fetchReminders()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, fetchReminders, supabase]);

    const addReminder = useCallback(async (reminderData: ReminderInput) => {
        if (!user) throw new Error("User not authenticated.");
        
        const dueDateValue = normalizeDateInput(reminderData.dueDate);
        const { error } = await supabase.from('reminders').insert({
            title: reminderData.title,
            amount: reminderData.amount ?? 0,
            due_date: dueDateValue,
            type: reminderData.type || 'one_time',
            category: reminderData.category || 'general',
            notes: reminderData.notes || '',
            status: reminderData.status || 'upcoming',
            repeat_rule: reminderData.repeatRule || null,
            snooze_count: reminderData.snoozeCount ?? 0,
            channels: reminderData.channels?.length ? reminderData.channels : ['push'],
            target_id: reminderData.targetId ?? null,
            target_type: reminderData.targetType || null,
            user_id: user.id
        });

        if (error) {
             console.error("Error adding reminder:", error);
             ui.showToast("Gagal membuat pengingat.", 'error');
             return;
        }

        ui.showToast("Pengingat berhasil dibuat!", 'success');
        ui.setReminderToEdit(null);
        ui.setIsReminderModalOpen(false);
        fetchReminders();
    }, [user, supabase, ui, fetchReminders]);

    const updateReminder = useCallback(async (reminderId: string, reminderData: ReminderInput) => {
        if (!user) throw new Error("User not authenticated.");
        
        const dueDateValue = normalizeDateInput(reminderData.dueDate);
        const { error } = await supabase.from('reminders').update({
            title: reminderData.title,
            amount: reminderData.amount ?? 0,
            due_date: dueDateValue,
            type: reminderData.type,
            category: reminderData.category,
            notes: reminderData.notes,
            status: reminderData.status,
            repeat_rule: reminderData.repeatRule,
            channels: reminderData.channels?.length ? reminderData.channels : ['push'],
            target_id: reminderData.targetId,
            target_type: reminderData.targetType
        }).eq('id', reminderId);

        if (error) {
             ui.showToast("Gagal memperbarui pengingat.", 'error');
             return;
        }

        ui.showToast("Pengingat diperbarui.", 'success');
        ui.setReminderToEdit(null);
        ui.setIsReminderModalOpen(false);
        fetchReminders();
    }, [user, supabase, ui, fetchReminders]);

    const deleteReminder = useCallback(async (reminderId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const { error } = await supabase.from('reminders').delete().eq('id', reminderId);
        if (error) {
             ui.showToast("Gagal menghapus pengingat.", 'error');
             return;
        }

        ui.showToast("Pengingat dihapus.", 'info');
        ui.setReminderToEdit(null);
        ui.setIsReminderModalOpen(false);
        setReminders(prev => prev.filter(r => r.id !== reminderId));
    }, [user, supabase, ui]);

    const markReminderComplete = useCallback(async (reminderId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const now = new Date().toISOString();
        const { error } = await supabase.from('reminders').update({
            status: 'completed',
            completed_at: now,
        }).eq('id', reminderId);

        if (error) {
             ui.showToast("Gagal update status.", 'error');
             return;
        }

        ui.showToast("Pengingat ditandai selesai.", 'success');
        setReminders(prev => prev.map(r => r.id === reminderId ? { ...r, status: 'completed', completedAt: now } : r));
    }, [user, supabase, ui]);

    const snoozeReminder = useCallback(async (reminderId: string, nextDueDate: string, currentCount: number = 0) => {
        if (!user) throw new Error("User not authenticated.");
        const { error } = await supabase.from('reminders').update({
            due_date: nextDueDate,
            status: 'snoozed',
            snooze_count: currentCount + 1,
        }).eq('id', reminderId);

        if (error) {
             ui.showToast("Gagal menunda pengingat.", 'error');
             return;
        }

        ui.showToast("Pengingat ditunda.", 'info');
        setReminders(prev => prev.map(r => r.id === reminderId ? { ...r, status: 'snoozed', dueDate: nextDueDate, snoozeCount: currentCount + 1 } : r));
    }, [user, supabase, ui]);


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
