import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

interface DatePickerProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label?: string;
    error?: string;
}

export function DatePicker<T extends FieldValues>({ control, name, label = "Tanggal", error }: DatePickerProps<T>) {
    return (
        <div className="space-y-2">
            <Label htmlFor={name} className={cn(error && "text-destructive")}>{label}</Label>
            <Controller
                control={control}
                name={name}
                render={({ field }) => (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id={name}
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal h-12",
                                    !field.value && "text-muted-foreground",
                                    error && "border-destructive hover:bg-destructive/10"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                    format(field.value, "d MMMM yyyy", { locale: dateFnsLocaleId })
                                ) : (
                                    <span>Pilih tanggal</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                locale={dateFnsLocaleId}
                            />
                        </PopoverContent>
                    </Popover>
                )}
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </div>
    );
}
