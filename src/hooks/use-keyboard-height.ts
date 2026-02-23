import { useEffect, useState } from 'react';

/**
 * Returns the current on-screen keyboard height in pixels.
 * Uses the Visual Viewport API so it works correctly on iOS Safari
 * where the layout viewport does not shrink when the keyboard opens.
 */
export function useKeyboardHeight(): number {
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.visualViewport) return;

        const update = () => {
            const vv = window.visualViewport!;
            // keyboard height = window inner height minus the visual viewport height.
            // Using window.innerHeight (layout viewport) because on iOS Safari it does
            // not shrink when the keyboard appears, whereas vv.height does.
            const kbHeight = window.innerHeight - vv.height;
            setKeyboardHeight(Math.max(0, kbHeight));
        };

        window.visualViewport.addEventListener('resize', update);
        window.visualViewport.addEventListener('scroll', update);

        return () => {
            window.visualViewport?.removeEventListener('resize', update);
            window.visualViewport?.removeEventListener('scroll', update);
        };
    }, []);

    return keyboardHeight;
}
