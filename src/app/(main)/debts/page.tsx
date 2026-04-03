import { redirect } from 'next/navigation';

export default function DebtsPage() {
    redirect('/wealth?tab=debts');
}
