import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { UIMessage } from 'ai';

vi.mock('./rich-results/BudgetStatusCard', () => ({
    BudgetStatusCard: () => <div data-testid="budget-status-card">Budget status</div>,
}));

vi.mock('./rich-results/WealthSummaryCard', () => ({
    WealthSummaryCard: () => <div data-testid="wealth-summary-card">Wealth summary</div>,
}));

vi.mock('./rich-results/RecentTransactionsList', () => ({
    RecentTransactionsList: () => <div data-testid="recent-transactions-card">Recent transactions</div>,
}));

vi.mock('./rich-results/ScenarioSimulationCard', () => ({
    ScenarioSimulationCard: () => <div data-testid="scenario-simulation-card">Scenario simulation</div>,
}));

vi.mock('./rich-results/SubscriptionAnalysisCard', () => ({
    SubscriptionAnalysisCard: () => <div data-testid="subscription-analysis-card">Subscription analysis</div>,
}));

vi.mock('./rich-results/FinancialHealthCard', () => ({
    FinancialHealthCard: () => <div data-testid="financial-health-card">Financial health</div>,
}));

import {
    RichMessageContent,
    extractAppActionsFromMessage,
    parseRichMessageParts,
    resolveChatResponse,
} from './ai-chat-drawer';

describe('AI chat rich message parsing', () => {
    it('splits valid render tags into discrete parser parts', () => {
        expect(parseRichMessageParts('Ringkasan [RENDER_COMPONENT:BudgetStatus] siap.')).toEqual([
            'Ringkasan ',
            '[RENDER_COMPONENT:BudgetStatus]',
            ' siap.',
        ]);
    });

    it('keeps malformed tags as trailing plain text instead of crashing', () => {
        expect(parseRichMessageParts('Ringkasan [RENDER_COMPONENT:BudgetStatus')).toEqual([
            'Ringkasan ',
            '[RENDER_COMPONENT:BudgetStatus',
        ]);
    });

    it('parses the typed response block before rendering', () => {
        const resolved = resolveChatResponse('<response>{"text":"Lihat budgetmu.","components":[{"type":"BudgetStatus"}],"suggestions":["Cek budget lain"]}</response>');

        expect(resolved.isPending).toBe(false);
        expect(resolved.response).toEqual({
            text: 'Lihat budgetmu.',
            components: [{ type: 'BudgetStatus' }],
            suggestions: ['Cek budget lain'],
        });
    });

    it('renders known component tags with surrounding text', () => {
        render(<RichMessageContent text="Lihat status budgetmu. [RENDER_COMPONENT:BudgetStatus]" />);

        expect(screen.getByText('Lihat status budgetmu.')).toBeDefined();
        expect(screen.getByTestId('budget-status-card')).toBeDefined();
    });

    it('renders typed rich components from the response envelope', () => {
        render(<RichMessageContent text={'<response>{"text":"Mutasi terbaru.","components":[{"type":"RecentTransactions"}]}</response>'} />);

        expect(screen.getByText('Mutasi terbaru.')).toBeDefined();
        expect(screen.getByTestId('recent-transactions-card')).toBeDefined();
    });

    it('extracts tool-based app actions from assistant message parts', () => {
        const message = {
            id: 'assistant-1',
            role: 'assistant',
            parts: [
                { type: 'text', text: 'Silakan lanjut.' },
                {
                    type: 'tool-app_action',
                    state: 'output-available',
                    output: {
                        type: 'navigate',
                        target: '/budgeting',
                        params: { label: 'Go to Budgets ->' },
                    },
                },
            ],
        } as UIMessage;

        expect(extractAppActionsFromMessage(message)).toEqual([
            {
                type: 'navigate',
                target: '/budgeting',
                params: { label: 'Go to Budgets ->' },
            },
        ]);
    });

    it('ignores unknown component tags without dropping surrounding content', () => {
        render(<RichMessageContent text="Pembuka [RENDER_COMPONENT:UnknownCard] penutup" />);

        expect(screen.getByText((content) => content.includes('Pembuka') && content.includes('penutup'))).toBeDefined();
        expect(screen.queryByTestId('budget-status-card')).toBeNull();
    });
});
