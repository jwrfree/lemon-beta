import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function GoalsPage() {
    redirect('/plan?tab=goals');
}
