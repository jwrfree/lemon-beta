import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, setHours, setMinutes } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { CalendarIcon, Clock } from 'lucide-react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import React, { useEffect, useState } from 'react';

interface DatePickerProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label?: string;
    error?: string;
}

export function DatePicker<T extends FieldValues>({ control, name, label = "Tanggal & Waktu", error }: DatePickerProps<T>) {
    return (
        <div className="space-y-2">
            <Controller
                control={control}
                name={name}
                render={({ field }) => {
                    // Local state for time input string (HH:mm)
                    // We derive it from field.value or default to current time
                    const [timeStr, setTimeStr] = useState(() => 
                        field.value ? format(field.value, 'HH:mm') : format(new Date(), 'HH:mm')
                    );

                    // Sync timeStr when field.value changes externally (e.g. initial load)
                    useEffect(() => {
                        if (field.value) {
                            setTimeStr(format(field.value, 'HH:mm'));
                        }
                    }, [field.value]);

                    const handleDateSelect = (date: Date | undefined) => {
                        if (!date) return;
                        // Preserve existing time from timeStr
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
                                        id={name}
                                        variant="outline"
                                        className={cn(
                                            "flex-1 justify-start text-left font-normal h-12 rounded-lg border-border",
                                            !field.value && "text-muted-foreground",
                                            error && "border-destructive hover:bg-destructive/10"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
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
                                    <Clock className="h-4 w-4 text-muted-foreground/50" />
                                </div>
                                <Input
                                    type="time"
                                    value={timeStr}
                                    onChange={handleTimeChange}
                                    className={cn(
                                        "h-12 pl-9 rounded-lg border-border bg-transparent",
                                        error && "border-destructive"
                                    )}
                                />
                            </div>
                        </div>
                    );
                }}
            />
            {error && <p className="text-[10px] font-medium text-destructive mt-1">{error}</p>}
        </div>
    );
}
