import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Calculator } from 'lucide-react';
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
            <Controller
                control={control}
                name={name}
                render={({ field }) => (
                    <div className="space-y-3">
                        <div className="relative group">
                            <Input
                                {...field}
                                id={name}
                                placeholder={placeholder}
                                onChange={(e) => {
                                    // Allow numbers and math operators
                                    const value = e.target.value.replace(/[^0-9+\-*/.]/g, '');
                                    field.onChange(value);
                                }}
                                onBlur={() => {
                                    // Try to evaluate on blur if it contains operators
                                    if (/[+\-*/]/.test(field.value)) {
                                        try {
                                            // Simple safe evaluation using Function constructor (only for math)
                                            // Remove any non-math characters first to be safe
                                            const sanitized = field.value.replace(/[^0-9+\-*/.]/g, '');
                                            const result = new Function(`return ${sanitized}`)();
                                            if (!isNaN(result)) {
                                                field.onChange(new Intl.NumberFormat('id-ID').format(Math.floor(result)));
                                            }
                                        } catch (e) {
                                            // Fallback if evaluation fails
                                        }
                                    } else if (field.value) {
                                        // Standard format if no operators
                                        const raw = field.value.replace(/[^0-9]/g, '');
                                        field.onChange(new Intl.NumberFormat('id-ID').format(parseInt(raw) || 0));
                                    }
                                }}
                                inputMode="text"
                                className={cn(
                                    "text-2xl font-medium h-14 bg-muted/20 border-border/50 focus-visible:ring-primary/30 pr-12",
                                    error && "border-destructive focus-visible:ring-destructive"
                                )}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary/50 transition-colors">
                                <Calculator className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {[10000, 20000, 50000, 100000, 200000, 500000].map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    onClick={() => field.onChange(new Intl.NumberFormat('id-ID').format(amount))}
                                    className="px-3 py-1.5 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary text-xs font-medium border border-border/50 transition-colors whitespace-nowrap active:scale-95"
                                >
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </div>
    );
}

