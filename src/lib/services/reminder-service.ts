import { createClient } from '@/lib/supabase/client';
import { normalizeDateInput } from '@/lib/utils';
import type { Reminder, ReminderInput, ReminderRow } from '@/types/models';

export const mapReminderFromDb = (r: ReminderRow): Reminder => ({
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

export const reminderService = {
    async getReminders(userId: string): Promise<Reminder[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('reminders')
            .select('*')
            .eq('user_id', userId)
            .order('due_date', { ascending: true });

        if (error) throw error;
        return (data || []).map(mapReminderFromDb);
    },

    async addReminder(userId: string, reminderData: ReminderInput): Promise<void> {
        const supabase = createClient();
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
            user_id: userId
        });
        if (error) throw error;
    },

    async updateReminder(reminderId: string, reminderData: ReminderInput): Promise<void> {
        const supabase = createClient();
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
        if (error) throw error;
    },

    async deleteReminder(reminderId: string): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase.from('reminders').delete().eq('id', reminderId);
        if (error) throw error;
    },

    async markComplete(reminderId: string): Promise<string> {
        const supabase = createClient();
        const now = new Date().toISOString();
        const { error } = await supabase.from('reminders').update({
            status: 'completed',
            completed_at: now,
        }).eq('id', reminderId);
        if (error) throw error;
        return now;
    },

    async snooze(reminderId: string, nextDueDate: string, currentCount: number = 0): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase.from('reminders').update({
            due_date: nextDueDate,
            status: 'snoozed',
            snooze_count: currentCount + 1,
        }).eq('id', reminderId);
        if (error) throw error;
    }
};
