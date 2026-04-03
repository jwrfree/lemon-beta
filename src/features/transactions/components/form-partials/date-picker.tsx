import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, setHours, setMinutes } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { CalendarBlank, Clock } from '@/lib/icons';
import { Control, Controller, ControllerRenderProps, FieldValues, Path } from 'react-hook-form';
import React, { useEffect, useState } from 'react';

interface DatePickerProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label?: string;
    error?: string;
}

interface DatePickerFieldProps {
    field: ControllerRenderProps<FieldValues, string>;
    inputId: string;
    error?: string;
}

const DatePickerField = ({ field, inputId, error }: DatePickerFieldProps) => {
    const [timeStr, setTimeStr] = useState(() =>
        field.value ? format(field.value, 'HH:mm') : format(new Date(), 'HH:mm')
    );

    useEffect(() => {
        if (field.value) {
            setTimeStr(format(field.value, 'HH:mm'));
        }
    }, [field.value]);

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        const [hours, minutes] = timeStr.split(':').map(Number);
        const newDateTime = setMinutes(setHours(date, hours), minutes);
        field.onChange(newDateTime);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = e.target.value;
        setTimeStr(newTime);

        if (field.value) {
            const [hours, minutes] = newTime.split(':').map(Number);
            const newDateTime = setMinutes(setHours(field.value, hours), minutes);
            field.onChange(newDateTime);
        }
    };

    return (
        <div className="flex gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id={inputId}
                        variant="outline"
                        className={cn(
                            "h-12 flex-1 justify-start rounded-lg bg-background border border-border/40 text-left font-normal",
                            !field.value && "text-muted-foreground",
                            error && "border-destructive hover:bg-destructive/10"
                        )}
                    >
                        <CalendarBlank size={16} weight="regular" className="mr-2 opacity-50" />
                        {field.value ? (
                            format(field.value, "d MMM yyyy", { locale: dateFnsLocaleId })
                        ) : (
                            <span>Pilih tanggal</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={handleDateSelect}
                        initialFocus
                        locale={dateFnsLocaleId}
                    />
                </PopoverContent>
            </Popover>

            <div className="relative w-28">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Clock size={16} weight="regular" className="text-muted-foreground/50" />
                </div>
                <Input
                    type="time"
                    value={timeStr}
                    onChange={handleTimeChange}
                    className={cn(
                        "h-12 rounded-lg bg-background border border-border/40 pl-9",
                        error && "border-destructive"
                    )}
                />
            </div>
        </div>
    );
};

export function DatePicker<T extends FieldValues>({ control, name, label: _label = "Tanggal & Waktu", error }: DatePickerProps<T>) {
    return (
        <div className="space-y-2">
            <Controller
                control={control}
                name={name}
                render={({ field }) => {
                    return (
                        <DatePickerField field={field as ControllerRenderProps<FieldValues, string>} inputId={String(name)} error={error} />
                    );
                }}
            />
            {error && <p className="text-label-md font-medium text-destructive mt-1">{error}</p>}
        </div>
    );
}

