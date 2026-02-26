import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Calculator, Delete, Keyboard } from 'lucide-react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

interface AmountInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  error?: string;
  placeholder?: string;
  useCustomKeyboard?: boolean;
}

type Token = { type: 'number'; value: number } | { type: 'operator'; value: '+' | '-' | '*' | '/' };

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

const formatAmount = (amount: number) => new Intl.NumberFormat('id-ID').format(Math.max(0, Math.floor(amount)));

const tokenizeExpression = (expression: string): Token[] => {
  const sanitized = expression.replace(/[^0-9+\-*/]/g, '');
  const tokens: Token[] = [];
  let current = '';

  for (const char of sanitized) {
    if (/[0-9]/.test(char)) {
      current += char;
      continue;
    }

    if (/[+\-*/]/.test(char)) {
      if (current) {
        tokens.push({ type: 'number', value: Number(current) });
        current = '';
      }

      const prev = tokens[tokens.length - 1];
      if (!prev || prev.type === 'operator') continue;

      tokens.push({ type: 'operator', value: char as '+' | '-' | '*' | '/' });
    }
  }

  if (current) tokens.push({ type: 'number', value: Number(current) });
  if (tokens.at(-1)?.type === 'operator') tokens.pop();

  return tokens;
};

const evaluateTokens = (tokens: Token[]): number => {
  if (!tokens.length) return 0;

  const stack: Token[] = [];
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index];

    if (token.type === 'number') {
      stack.push(token);
      index += 1;
      continue;
    }

    const operator = token.value;
    const next = tokens[index + 1];

    if (operator === '*' || operator === '/') {
      const prev = stack.pop();
      if (!prev || prev.type !== 'number' || !next || next.type !== 'number') {
        index += 1;
        continue;
      }

      const result = operator === '*' ? prev.value * next.value : next.value === 0 ? 0 : prev.value / next.value;
      stack.push({ type: 'number', value: result });
      index += 2;
      continue;
    }

    stack.push(token);
    index += 1;
  }

  let total = 0;
  let currentOperator: '+' | '-' = '+';

  stack.forEach((token) => {
    if (token.type === 'operator' && (token.value === '+' || token.value === '-')) {
      currentOperator = token.value;
      return;
    }

    if (token.type === 'number') {
      total = currentOperator === '+' ? total + token.value : total - token.value;
    }
  });

  return Math.max(0, Math.floor(total));
};

const normalizeExpressionInput = (value: string): string => value.replace(/[^0-9+\-*/]/g, '').replace(/([+\-*/]){2,}/g, '$1');

export function AmountInput<T extends FieldValues>({
  control,
  name,
  label = 'Jumlah',
  error,
  placeholder = 'Rp 0',
  useCustomKeyboard = false,
}: AmountInputProps<T>) {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const keypadRows = useMemo(
    () => [
      ['1', '2', '3', '+'],
      ['4', '5', '6', '-'],
      ['7', '8', '9', '×'],
      ['00', '0', '⌫', '÷'],
    ],
    []
  );

  return (
    <div className="space-y-2">
      <p className="text-label tracking-wider text-muted-foreground">{label}</p>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const fieldString = (field.value ?? '').toString();
          const hasOperator = /[+\-*/]/.test(fieldString);

          const applyExpression = () => {
            const tokens = tokenizeExpression(fieldString);
            if (!tokens.length) {
              field.onChange('');
              return;
            }
            field.onChange(formatAmount(evaluateTokens(tokens)));
          };

          const appendFromKeyboard = (key: string) => {
            if (key === '⌫') {
              field.onChange(fieldString.slice(0, -1));
              return;
            }

            const mapped = key === '×' ? '*' : key === '÷' ? '/' : key;
            const next = normalizeExpressionInput(`${fieldString}${mapped}`);
            field.onChange(next);
          };

          return (
            <div className="space-y-3">
              <div className="relative group">
                <Input
                  {...field}
                  id={name}
                  value={fieldString}
                  placeholder={placeholder}
                  onFocus={() => {
                    if (useCustomKeyboard) setIsKeyboardOpen(true);
                  }}
                  onChange={(e) => {
                    const next = normalizeExpressionInput(e.target.value);
                    field.onChange(next);
                  }}
                  onBlur={applyExpression}
                  inputMode={useCustomKeyboard ? 'none' : 'text'}
                  className={cn(
                    'text-2xl font-medium h-14 rounded-card bg-muted/20 border-border/50 focus-visible:border-primary/50 focus-visible:ring-primary/20 pr-20',
                    error && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20'
                  )}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-muted-foreground/40">
                  {useCustomKeyboard && (
                    <button
                      type="button"
                      onClick={() => setIsKeyboardOpen((prev) => !prev)}
                      className="rounded-md p-1 hover:bg-muted/60 transition-colors"
                    >
                      <Keyboard className="h-4 w-4" />
                    </button>
                  )}
                  <Calculator className="h-5 w-5" />
                </div>
              </div>

              {hasOperator && (
                <button
                  type="button"
                  onClick={applyExpression}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted/60 transition-colors"
                >
                  Gunakan hasil tokenisasi ekspresi
                </button>
              )}

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {QUICK_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => field.onChange(formatAmount(amount))}
                    className="px-3 py-1.5 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary text-xs font-medium border border-border/50 transition-colors whitespace-nowrap active:scale-95"
                  >
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)}
                  </button>
                ))}
              </div>

              {useCustomKeyboard && isKeyboardOpen && (
                <div className="rounded-2xl border border-border/70 bg-card p-3 space-y-2">
                  {keypadRows.map((row, index) => (
                    <div key={`row-${index}`} className="grid grid-cols-4 gap-2">
                      {row.map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => appendFromKeyboard(key)}
                          className={cn(
                            'h-10 rounded-lg text-sm font-medium border transition-colors',
                            ['+', '-', '×', '÷'].includes(key)
                              ? 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10'
                              : key === '⌫'
                                ? 'border-border bg-muted/60 text-muted-foreground hover:bg-muted'
                                : 'border-border/80 bg-background hover:bg-muted/40'
                          )}
                        >
                          {key === '⌫' ? <Delete className="h-4 w-4 mx-auto" /> : key}
                        </button>
                      ))}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsKeyboardOpen(false)}
                    className="w-full h-9 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50"
                  >
                    Selesai
                  </button>
                </div>
              )}
            </div>
          );
        }}
      />
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
