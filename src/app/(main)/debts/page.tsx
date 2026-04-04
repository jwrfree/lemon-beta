import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function DebtsPage() {
    redirect('/wealth?tab=debts');
}
