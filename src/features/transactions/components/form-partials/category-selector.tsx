import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CaretDown, CircleNotch, Sparkle } from '@/lib/icons';
import { AnimatePresence, motion } from 'framer-motion';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Category } from '@/lib/categories';
import { CategoryGrid } from '../category-grid';
import { SubCategorySheet } from '../sub-category-sheet';
import { getCategoryIcon } from '@/lib/category-utils';

interface CategorySelectorProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    subCategoryName?: Path<T>;
    value?: string;
    categories: Category[];
    label?: string;
    error?: string;
    isSuggesting?: boolean;
    isAiSuggested?: boolean;
    onSubCategoryChange?: (_value: string) => void;
}

export function CategorySelector<T extends FieldValues>({
    control,
    name,
    value = '',
    categories,
    label = "Kategori",
    error,
    isSuggesting,
    isAiSuggested,
    onSubCategoryChange
}: CategorySelectorProps<T>) {
    const [isSubCategorySheetOpen, setIsSubCategorySheetOpen] = useState(false);
    const [selectedCategoryForSub, setSelectedCategoryForSub] = useState<Category | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [localSubCategory, setLocalSubCategory] = useState<string>(value);

    React.useEffect(() => {
        setLocalSubCategory(value);
    }, [value]);

    const handleCategoryClick = (category: Category, onChange: (_nextValue: string) => void) => {
        onChange(category.name);
        if (onSubCategoryChange) {
            onSubCategoryChange('');
            setLocalSubCategory('');
        }

        if (category.sub_categories && category.sub_categories.length > 0) {
            setSelectedCategoryForSub(category);
            setIsSubCategorySheetOpen(true);
        } else {
            setSelectedCategoryForSub(null);
        }
    };

    const handleSubCategorySelect = (nextValue: string) => {
        setLocalSubCategory(nextValue);
        if (onSubCategoryChange) {
            onSubCategoryChange(nextValue);
        }
        setIsSubCategorySheetOpen(false);
    };

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => {
                const selectedCategory = categories.find((category) => category.name === field.value);

                return (
                    <div className="space-y-2">
                        <div className="min-h-[20px] flex items-center justify-end">
                            <AnimatePresence>
                                {isSuggesting && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-1 rounded-md bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary"
                                    >
                                        <CircleNotch size={10} weight="regular" className="animate-spin" />
                                        AI berpikir...
                                    </motion.div>
                                )}
                                {!isSuggesting && isAiSuggested && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-1 rounded-md bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning shadow-[0_10px_18px_-16px_rgba(245,158,11,0.45)]"
                                    >
                                        <Sparkle size={10} weight="regular" className="text-warning" />
                                        Disarankan AI
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="space-y-3">
                            <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                    "flex h-auto w-full items-center justify-between rounded-lg bg-secondary/72 p-4 shadow-[0_16px_32px_-26px_rgba(15,23,42,0.18)] transition-all active:scale-[0.99]",
                                    isExpanded && "bg-background ring-2 ring-primary/20 shadow-[0_18px_36px_-28px_rgba(13,148,136,0.18)]",
                                    error && "border-destructive hover:bg-destructive/5"
                                )}
                                onClick={() => setIsExpanded(!isExpanded)}
                                aria-label={label}
                            >
                                <div className="flex items-center gap-3">
                                    {selectedCategory ? (
                                        <>
                                            <div className={cn(
                                                "flex h-10 w-10 items-center justify-center rounded-lg shadow-[0_10px_20px_-18px_rgba(15,23,42,0.16)]",
                                                selectedCategory.bg_color,
                                                selectedCategory.color
                                            )}>
                                                {(() => {
                                                    const Icon = getCategoryIcon(selectedCategory.icon);
                                                    return <Icon size={20} />;
                                                })()}
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="text-sm font-medium tracking-tight">{selectedCategory.name}</span>
                                                {localSubCategory ? (
                                                    <span className="text-xs font-medium text-primary">- {localSubCategory}</span>
                                                ) : (
                                                    <span className="text-xs font-medium text-muted-foreground">Klik untuk ganti kategori</span>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                                                <Sparkle size={20} weight="regular" className="text-muted-foreground/40" />
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground">Pilih Kategori</span>
                                        </>
                                    )}
                                </div>
                                <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-background/82 text-muted-foreground shadow-[0_10px_20px_-18px_rgba(15,23,42,0.16)]"
                                >
                                    <CaretDown size={16} weight="regular" />
                                </motion.div>
                            </Button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-1 pb-4 pt-2">
                                            <CategoryGrid
                                                categories={categories}
                                                selectedCategory={field.value}
                                                onCategorySelect={(category) => {
                                                    handleCategoryClick(category, field.onChange);
                                                    setIsExpanded(false);
                                                }}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        {error && <p className="mt-1 text-sm font-medium text-destructive">{error}</p>}

                        <AnimatePresence>
                            {isSubCategorySheetOpen && selectedCategoryForSub && onSubCategoryChange && (
                                <SubCategorySheet
                                    category={selectedCategoryForSub}
                                    selectedValue={localSubCategory}
                                    onSelect={handleSubCategorySelect}
                                    onClose={() => setIsSubCategorySheetOpen(false)}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                );
            }}
        />
    );
}

