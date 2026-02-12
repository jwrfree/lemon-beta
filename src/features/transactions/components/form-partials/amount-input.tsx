import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

interface AmountInputProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label?: string;
    error?: string;
    placeholder?: string;
}

export function AmountInput<T extends FieldValues>({ control, name, label = "Jumlah", error, placeholder = "Rp 0" }: AmountInputProps<T>) {
    return (
        <div className="space-y-2">
            <Label htmlFor={name} className={cn(error && "text-destructive")}>{label}</Label>
            <Controller
                control={control}
                name={name}
                render={({ field }) => (
                    <Input
                        {...field}
                        id={name}
                        placeholder={placeholder}
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/[^0-9]/g, '');
                            if (rawValue === '') {
                                field.onChange('');
                                return;
                            }
                            field.onChange(new Intl.NumberFormat('id-ID').format(parseInt(rawValue) || 0));
                        }}
                        inputMode="numeric"
                        className={cn("text-2xl font-bold h-14", error && "border-destructive focus-visible:ring-destructive")}
                    />
                )}
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </div>
    );
}
