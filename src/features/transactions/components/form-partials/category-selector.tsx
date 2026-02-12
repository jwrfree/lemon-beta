import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Category } from '@/lib/categories';
import { CategoryGrid } from '../category-grid';
import { SubCategorySheet } from '../sub-category-sheet';

interface CategorySelectorProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    subCategoryName?: Path<T>;
    categories: Category[];
    label?: string;
    error?: string;
    isSuggesting?: boolean;
    isAiSuggested?: boolean;
    onSubCategoryChange?: (value: string) => void;
}

export function CategorySelector<T extends FieldValues>({
    control,
    name,
    subCategoryName,
    categories,
    label = "Kategori",
    error,
    isSuggesting,
    isAiSuggested,
    onSubCategoryChange
}: CategorySelectorProps<T>) {
    const [isSubCategorySheetOpen, setIsSubCategorySheetOpen] = useState(false);
    const [selectedCategoryForSub, setSelectedCategoryForSub] = useState<Category | null>(null);

    const handleCategoryClick = (cat: Category, onChange: (value: string) => void) => {
        onChange(cat.name);
        if (onSubCategoryChange) onSubCategoryChange(''); // Reset subcategory

        if (cat.sub_categories && cat.sub_categories.length > 0) {
            setSelectedCategoryForSub(cat);
            setIsSubCategorySheetOpen(true);
        } else {
            setSelectedCategoryForSub(null);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor={name} className={cn(error && "text-destructive")}>{label}</Label>
                <AnimatePresence>
                    {isSuggesting && (
                        <motion.div
                            initial={{ opacity: 0, x: 5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-1 text-[10px] text-primary font-medium bg-primary/5 px-2 py-0.5 rounded-md"
                        >
                            <Loader2 className="h-2.5 w-2.5 animate-spin" />
                            AI berpikir...
                        </motion.div>
                    )}
                    {!isSuggesting && isAiSuggested && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-1 text-[10px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100"
                        >
                            <Sparkles className="h-2.5 w-2.5 fill-amber-600" />
                            Disarankan AI
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <Controller
                control={control}
                name={name}
                render={({ field }) => (
                    <>
                        <Button
                            id={name}
                            type="button"
                            variant="outline"
                            className={cn(
                                "flex w-full items-center justify-between rounded-xl p-3 h-auto min-h-[3.5rem]",
                                error && "border-destructive hover:bg-destructive/10"
                            )}
                            onClick={() => {
                                const catObj = categories.find(c => c.name === field.value);
                                if (catObj && catObj.sub_categories?.length) {
                                    setSelectedCategoryForSub(catObj);
                                    setIsSubCategorySheetOpen(true);
                                }
                                // If no subcategories, maybe open a full category picker modal? 
                                // For now we rely on the grid below.
                            }}
                        >
                            {field.value ? (
                                <div className="flex flex-col text-left">
                                    <span className="font-medium truncate">{field.value}</span>
                                    {/* Subcategory display logic would be passed in or handled via separate prop if needed */}
                                </div>
                            ) : (
                                <span className="text-muted-foreground">Pilih dari grid di bawah</span>
                            )}
                            {/* <ChevronRight className="h-5 w-5 text-muted-foreground" /> */}
                        </Button>

                        <CategoryGrid
                            categories={categories}
                            selectedCategory={field.value}
                            onCategorySelect={(cat) => handleCategoryClick(cat, field.onChange)}
                        />
                    </>
                )}
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <AnimatePresence>
                {isSubCategorySheetOpen && selectedCategoryForSub && onSubCategoryChange && (
                    <SubCategorySheet
                        category={selectedCategoryForSub}
                        selectedValue={""} // You might need to pass the actual subcategory value here
                        onSelect={(val) => {
                            onSubCategoryChange(val);
                            setIsSubCategorySheetOpen(false);
                        }}
                        onClose={() => setIsSubCategorySheetOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
