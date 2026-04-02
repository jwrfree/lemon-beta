import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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

import { RichMessageContent, parseRichMessageParts } from './ai-chat-drawer';

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

    it('renders known component tags with surrounding text', () => {
        render(<RichMessageContent text="Lihat status budgetmu. [RENDER_COMPONENT:BudgetStatus]" />);

        expect(screen.getByText('Lihat status budgetmu.')).toBeDefined();
        expect(screen.getByTestId('budget-status-card')).toBeDefined();
    });

    it('ignores unknown component tags without dropping surrounding content', () => {
        render(<RichMessageContent text="Pembuka [RENDER_COMPONENT:UnknownCard] penutup" />);

        expect(screen.getByText('Pembuka')).toBeDefined();
        expect(screen.getByText('penutup')).toBeDefined();
        expect(screen.queryByTestId('budget-status-card')).toBeNull();
    });
});
