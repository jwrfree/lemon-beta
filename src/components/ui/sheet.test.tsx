import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sheet, SheetContent } from './sheet';

describe('SheetContent - hideCloseButton prop', () => {
    it('renders the default sr-only close button when hideCloseButton is not provided', () => {
        render(
            <Sheet open={true}>
                <SheetContent>Sheet body</SheetContent>
            </Sheet>
        );
        // The default SheetContent includes a SheetPrimitive.Close with sr-only "Close" text
        expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('does not render the close button when hideCloseButton={true}', () => {
        render(
            <Sheet open={true}>
                <SheetContent hideCloseButton>Sheet body</SheetContent>
            </Sheet>
        );
        expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
    });

    it('still renders children when hideCloseButton={true}', () => {
        render(
            <Sheet open={true}>
                <SheetContent hideCloseButton>
                    <span>Smart Add Content</span>
                </SheetContent>
            </Sheet>
        );
        expect(screen.getByText('Smart Add Content')).toBeInTheDocument();
    });

    it('renders children regardless of hideCloseButton value', () => {
        const { rerender } = render(
            <Sheet open={true}>
                <SheetContent>Content A</SheetContent>
            </Sheet>
        );
        expect(screen.getByText('Content A')).toBeInTheDocument();

        rerender(
            <Sheet open={true}>
                <SheetContent hideCloseButton>Content A</SheetContent>
            </Sheet>
        );
        expect(screen.getByText('Content A')).toBeInTheDocument();
    });
});
