import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAiCategorySuggestion } from './use-ai-category-suggestion';

vi.mock('../hooks/use-transactions', () => ({
  useCategories: () => ({
    expenseCategories: [{ name: 'Konsumsi & F&B' }],
    incomeCategories: [{ name: 'Gaji & Tetap' }],
  }),
}));

const suggestCategoryMock = vi.fn();
vi.mock('@/ai/flows/suggest-category-flow', () => ({
  suggestCategory: (...args: unknown[]) => suggestCategoryMock(...args),
}));

describe('useAiCategorySuggestion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('auto-applies suggestion when current category is empty', async () => {
    suggestCategoryMock.mockResolvedValue({ category: 'Konsumsi & F&B', confidence: 0.9 });
    const setValue = vi.fn();

    renderHook(() =>
      useAiCategorySuggestion({
        description: 'makan siang',
        type: 'expense',
        currentCategory: '',
        isEditMode: false,
        setValue,
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 900));

    await waitFor(() => {
      expect(setValue).toHaveBeenCalledWith('category', 'Konsumsi & F&B', { shouldValidate: true });
    });
  });

  it('does not override category when user has selected one', async () => {
    suggestCategoryMock.mockResolvedValue({ category: 'Konsumsi & F&B', confidence: 0.95 });
    const setValue = vi.fn();

    renderHook(() =>
      useAiCategorySuggestion({
        description: 'makan siang',
        type: 'expense',
        currentCategory: 'Transportasi',
        isEditMode: false,
        setValue,
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 900));

    await waitFor(() => {
      expect(suggestCategoryMock).toHaveBeenCalled();
    });
    expect(setValue).not.toHaveBeenCalled();
  });
});
