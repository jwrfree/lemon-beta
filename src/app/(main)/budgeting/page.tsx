import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function BudgetingPage() {
    redirect('/plan?tab=budget');
}
