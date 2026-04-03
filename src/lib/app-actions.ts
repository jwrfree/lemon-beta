/**
 * App Actions Registry — Phase 3
 * Central source of truth for all targetable sections and actions in the app.
 * Used by the Lemon Coach chat bridge to navigate, highlight, and trigger UI.
 */

export type HighlightTarget = {
    type: 'highlight';
    elementId: string;
};

export type StateTarget = {
    type: 'state';
    key: string;
    value: unknown;
    eventName: string; // CustomEvent name to dispatch
};

export type ParamTarget = {
    type: 'param';
    param: string;
    eventName: string; // CustomEvent name to dispatch
};

export type NavigateTarget = {
    type: 'navigate';
    path: string;
};

export type UIActionTarget = {
    type: 'ui-action';
    fn: 'openTransactionSheet' | 'setIsBudgetModalOpen' | 'setIsAIChatOpen' | 'setIsGoalModalOpen' | 'setIsReminderModalOpen' | 'setIsDebtModalOpen';
};

export type AppTarget =
    | HighlightTarget
    | StateTarget
    | ParamTarget
    | NavigateTarget
    | UIActionTarget;

export const APP_TARGETS = {
    // ─── Dashboard highlight targets ──────────────────────────────────
    'dashboard/financial-pulse': {
        type: 'highlight',
        elementId: 'widget-financial-pulse',
    } satisfies HighlightTarget,

    'dashboard/recent-transactions': {
        type: 'highlight',
        elementId: 'widget-recent-transactions',
    } satisfies HighlightTarget,

    'dashboard/budget-status': {
        type: 'highlight',
        elementId: 'widget-budget-status',
    } satisfies HighlightTarget,

    'dashboard/risk-score': {
        type: 'highlight',
        elementId: 'widget-risk-score',
    } satisfies HighlightTarget,

    'dashboard/net-worth': {
        type: 'highlight',
        elementId: 'widget-net-worth',
    } satisfies HighlightTarget,

    'dashboard/goals': {
        type: 'highlight',
        elementId: 'widget-goals',
    } satisfies HighlightTarget,

    'dashboard/alerts': {
        type: 'highlight',
        elementId: 'widget-alerts',
    } satisfies HighlightTarget,

    // ─── Dashboard state targets ───────────────────────────────────────
    'dashboard/analyst-view': {
        type: 'state',
        key: 'isAnalystView',
        value: true,
        eventName: 'lemon:set-analyst-view',
    } satisfies StateTarget,

    // ─── Dashboard param targets ───────────────────────────────────────
    'dashboard/wallet-filter': {
        type: 'param',
        param: 'walletId',
        eventName: 'lemon:set-wallet-filter',
    } satisfies ParamTarget,

    // ─── Global modal/sheet actions (via UIProvider) ───────────────────
    'action/open-add-transaction': {
        type: 'ui-action',
        fn: 'openTransactionSheet',
    } satisfies UIActionTarget,

    'action/open-add-budget': {
        type: 'ui-action',
        fn: 'setIsBudgetModalOpen',
    } satisfies UIActionTarget,

    'action/open-ai-chat': {
        type: 'ui-action',
        fn: 'setIsAIChatOpen',
    } satisfies UIActionTarget,

    'action/open-add-goal': {
        type: 'ui-action',
        fn: 'setIsGoalModalOpen',
    } satisfies UIActionTarget,

    'action/open-add-reminder': {
        type: 'ui-action',
        fn: 'setIsReminderModalOpen',
    } satisfies UIActionTarget,

    'action/open-add-debt': {
        type: 'ui-action',
        fn: 'setIsDebtModalOpen',
    } satisfies UIActionTarget,

    'action/open-add-liability': {
        type: 'ui-action',
        fn: 'setIsDebtModalOpen',
    } satisfies UIActionTarget,

    'ADD_LIABILITY': {
        type: 'ui-action',
        fn: 'setIsDebtModalOpen',
    } satisfies UIActionTarget,

    // ─── Page navigation ───────────────────────────────────────────────
    'page/budgeting': {
        type: 'navigate',
        path: '/budgeting',
    } satisfies NavigateTarget,

    'page/goals': {
        type: 'navigate',
        path: '/goals',
    } satisfies NavigateTarget,

    'page/reminders': {
        type: 'navigate',
        path: '/reminders',
    } satisfies NavigateTarget,

    'page/debts': {
        type: 'navigate',
        path: '/debts',
    } satisfies NavigateTarget,

    'page/transactions': {
        type: 'navigate',
        path: '/transactions',
    } satisfies NavigateTarget,

    'page/assets-liabilities': {
        type: 'navigate',
        path: '/assets-liabilities',
    } satisfies NavigateTarget,

    // ─── Aliases for AI generated targets ─────────────────────────────
    '/budgeting': { type: 'navigate', path: '/budgeting' } satisfies NavigateTarget,
    '/budget': { type: 'navigate', path: '/budgeting' } satisfies NavigateTarget,
    'page/budget': { type: 'navigate', path: '/budgeting' } satisfies NavigateTarget,
    
    '/goals': { type: 'navigate', path: '/goals' } satisfies NavigateTarget,
    '/goal': { type: 'navigate', path: '/goals' } satisfies NavigateTarget,
    'page/goal': { type: 'navigate', path: '/goals' } satisfies NavigateTarget,
    
    '/reminders': { type: 'navigate', path: '/reminders' } satisfies NavigateTarget,
    '/reminder': { type: 'navigate', path: '/reminders' } satisfies NavigateTarget,
    'page/reminder': { type: 'navigate', path: '/reminders' } satisfies NavigateTarget,
    
    '/debts': { type: 'navigate', path: '/debts' } satisfies NavigateTarget,
    '/debt': { type: 'navigate', path: '/debts' } satisfies NavigateTarget,
    'page/debt': { type: 'navigate', path: '/debts' } satisfies NavigateTarget,
    
    '/transactions': { type: 'navigate', path: '/transactions' } satisfies NavigateTarget,
    '/transaction': { type: 'navigate', path: '/transactions' } satisfies NavigateTarget,
    'page/transaction': { type: 'navigate', path: '/transactions' } satisfies NavigateTarget,

    '/assets-liabilities': { type: 'navigate', path: '/assets-liabilities' } satisfies NavigateTarget,
    '/assets': { type: 'navigate', path: '/assets-liabilities' } satisfies NavigateTarget,

    'page/charts': {
        type: 'navigate',
        path: '/charts',
    } satisfies NavigateTarget,
} as const;

export type AppTargetKey = keyof typeof APP_TARGETS;

/**
 * Executes an app action by its target key.
 * Supports highlight, navigate, state, param, and ui-action types.
 *
 * @param key - The target key from APP_TARGETS
 * @param params - Optional key-value params for 'param' type targets
 * @param uiActions - UIProvider action functions for 'ui-action' types
 * @param router - next/navigation router for 'navigate' types
 */
export function executeAppAction(
    key: AppTargetKey,
    params?: Record<string, unknown>,
    uiActions?: Partial<Record<UIActionTarget['fn'], (v?: unknown) => void>>,
    router?: { push: (path: string) => void }
): void {
    const target = APP_TARGETS[key] as AppTarget;
    if (!target) {
        console.warn(`[AppActions] Unknown target key: "${key}"`);
        return;
    }

    switch (target.type) {
        case 'highlight': {
            const el = document.getElementById(target.elementId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('lemon-highlight');
                setTimeout(() => el.classList.remove('lemon-highlight'), 2000);
            } else {
                console.warn(`[AppActions] Element not found: #${target.elementId}`);
            }
            break;
        }

        case 'navigate': {
            router?.push(target.path);
            break;
        }

        case 'state': {
            window.dispatchEvent(
                new CustomEvent(target.eventName, { detail: target.value })
            );
            break;
        }

        case 'param': {
            const value = params?.[target.param];
            if (value !== undefined) {
                window.dispatchEvent(
                    new CustomEvent(target.eventName, { detail: value })
                );
            }
            break;
        }

        case 'ui-action': {
            const fn = uiActions?.[target.fn];
            if (fn) {
                fn(true);
            } else {
                console.warn(`[AppActions] UIAction not provided: ${target.fn}`);
            }
            break;
        }
    }
}
