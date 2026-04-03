import { redirect } from 'next/navigation';

export default function BudgetingPage() {
    redirect('/plan?tab=budget');
}
