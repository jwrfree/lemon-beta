'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useUI } from '@/components/ui-provider';
import { createClient } from '@/lib/supabase/client';
import { reminderService } from '@/lib/services/reminder-service';
import type { Reminder, ReminderInput } from '@/types/models';

export const useReminders = () => {
    const { user } = useAuth();
    const ui = useUI();
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchReminders = useCallback(async () => {
        if (!user) return;
        try {
            const data = await reminderService.getReminders(user.id);
            setReminders(data);
        } catch (error) {
            console.error("Error fetching reminders:", error);
            ui.showToast("Gagal memuat pengingat.", 'error');
        } finally {
            setIsLoading(false);
        }
    }, [user, ui]);

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
        try {
            await reminderService.addReminder(user.id, reminderData);
            ui.showToast("Pengingat berhasil dibuat!", 'success');
            ui.setReminderToEdit(null);
            ui.setIsReminderModalOpen(false);
            fetchReminders();
        } catch {
            ui.showToast("Gagal membuat pengingat.", 'error');
        }
    }, [user, ui, fetchReminders]);

    const updateReminder = useCallback(async (reminderId: string, reminderData: ReminderInput) => {
        if (!user) throw new Error("User not authenticated.");
        try {
            await reminderService.updateReminder(reminderId, reminderData);
            ui.showToast("Pengingat diperbarui.", 'success');
            ui.setReminderToEdit(null);
            ui.setIsReminderModalOpen(false);
            fetchReminders();
        } catch {
            ui.showToast("Gagal memperbarui pengingat.", 'error');
        }
    }, [user, ui, fetchReminders]);

    const deleteReminder = useCallback(async (reminderId: string) => {
        if (!user) throw new Error("User not authenticated.");
        try {
            await reminderService.deleteReminder(reminderId);
            ui.showToast("Pengingat dihapus.", 'info');
            ui.setReminderToEdit(null);
            ui.setIsReminderModalOpen(false);
            setReminders(prev => prev.filter(r => r.id !== reminderId));
        } catch {
            ui.showToast("Gagal menghapus pengingat.", 'error');
        }
    }, [user, ui]);

    const markReminderComplete = useCallback(async (reminderId: string) => {
        if (!user) throw new Error("User not authenticated.");
        try {
            const now = await reminderService.markComplete(reminderId);
            ui.showToast("Pengingat ditandai selesai.", 'success');
            setReminders(prev => prev.map(r => r.id === reminderId ? { ...r, status: 'completed', completedAt: now } : r));
        } catch {
            ui.showToast("Gagal update status.", 'error');
        }
    }, [user, ui]);

    const snoozeReminder = useCallback(async (reminderId: string, nextDueDate: string, currentCount: number = 0) => {
        if (!user) throw new Error("User not authenticated.");
        try {
            await reminderService.snooze(reminderId, nextDueDate, currentCount);
            ui.showToast("Pengingat ditunda.", 'info');
            setReminders(prev => prev.map(r => r.id === reminderId ? { ...r, status: 'snoozed', dueDate: nextDueDate, snoozeCount: currentCount + 1 } : r));
        } catch {
            ui.showToast("Gagal menunda pengingat.", 'error');
        }
    }, [user, ui]);


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
