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
  hideQuickAmounts?: boolean;
  hideCalculatorIcon?: boolean;
  hideLabel?: boolean;
  showCurrencyPrefix?: boolean;
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

const normalizeExpressionInput = (value: string): string =>
  value.replace(/[^0-9+\-*/]/g, '').replace(/([+\-*/]){2,}/g, '$1');

export function AmountInput<T extends FieldValues>({
  control,
  name,
  label = 'Jumlah',
  error,
  placeholder = 'Rp 0',
  useCustomKeyboard = false,
  hideQuickAmounts = false,
  hideCalculatorIcon = false,
  hideLabel = false,
  showCurrencyPrefix = false,
}: AmountInputProps<T>) {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const keypadRows = useMemo(
    () => [
      ['1', '2', '3', '+'],
      ['4', '5', '6', '-'],
      ['7', '8', '9', '*'],
      ['00', '0', 'del', '/'],
    ],
    []
  );

  return (
    <div className="space-y-2">
      {!hideLabel && <p className="text-label tracking-wider text-muted-foreground">{label}</p>}
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const fieldString = (field.value ?? '').toString();
          const hasOperator = /[+\-*/]/.test(fieldString);
          const displayValue = hasOperator
            ? fieldString
            : fieldString
              ? formatAmount(Number(fieldString.replace(/[^0-9]/g, '')))
              : '';

          const applyExpression = () => {
            const tokens = tokenizeExpression(fieldString);
            if (!tokens.length) {
              field.onChange('');
              return;
            }
            field.onChange(formatAmount(evaluateTokens(tokens)));
          };

          const appendFromKeyboard = (key: string) => {
            if (key === 'del') {
              field.onChange(fieldString.slice(0, -1));
              return;
            }

            const next = normalizeExpressionInput(`${fieldString}${key}`);
            field.onChange(next);
          };

          return (
            <div className="space-y-3">
              <div className="relative group">
                <Input
                  {...field}
                  id={name}
                  value={displayValue}
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
                    'h-14 rounded-card bg-muted/22 pr-20 text-2xl font-medium shadow-[0_14px_28px_-24px_rgba(15,23,42,0.18)] focus-visible:ring-primary/20',
                    showCurrencyPrefix && 'pl-14',
                    error && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20'
                  )}
                />
                {showCurrencyPrefix && (
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">
                    Rp
                  </span>
                )}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-muted-foreground/40">
                  {useCustomKeyboard && (
                    <button
                      type="button"
                      onClick={() => setIsKeyboardOpen((prev) => !prev)}
                      className="rounded-md p-1 transition-colors hover:bg-muted/60"
                    >
                      <Keyboard className="h-4 w-4" />
                    </button>
                  )}
                  {!hideCalculatorIcon && <Calculator className="h-5 w-5" />}
                </div>
              </div>

              {hasOperator && (
                <button
                  type="button"
                  onClick={applyExpression}
                  className="rounded-full bg-background/96 px-3 py-1.5 text-xs shadow-[0_10px_20px_-18px_rgba(15,23,42,0.18)] transition-colors hover:bg-muted/60"
                >
                  Gunakan hasil tokenisasi ekspresi
                </button>
              )}

              {!hideQuickAmounts && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {QUICK_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => field.onChange(formatAmount(amount))}
                      className="whitespace-nowrap rounded-full bg-muted/55 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary/10 hover:text-primary active:scale-95"
                    >
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0,
                      }).format(amount)}
                    </button>
                  ))}
                </div>
              )}

              {useCustomKeyboard && isKeyboardOpen && (
                <div className="space-y-2 rounded-2xl bg-card/96 p-3 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.24)]">
                  {keypadRows.map((row, index) => (
                    <div key={`row-${index}`} className="grid grid-cols-4 gap-2">
                      {row.map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => appendFromKeyboard(key)}
                          className={cn(
                            'h-10 rounded-lg text-sm font-medium shadow-[0_10px_20px_-18px_rgba(15,23,42,0.16)] transition-colors',
                            ['+', '-', '*', '/'].includes(key)
                              ? 'bg-primary/7 text-primary hover:bg-primary/12'
                              : key === 'del'
                                ? 'bg-muted/65 text-muted-foreground hover:bg-muted'
                                : 'bg-background hover:bg-muted/40'
                          )}
                        >
                          {key === 'del' ? <Delete className="mx-auto h-4 w-4" /> : key}
                        </button>
                      ))}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsKeyboardOpen(false)}
                    className="h-9 w-full rounded-lg bg-muted/55 text-xs text-muted-foreground transition-colors hover:bg-muted/70"
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
