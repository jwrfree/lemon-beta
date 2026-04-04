import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function AssetsLiabilitiesPage() {
    redirect('/wealth?tab=assets');
}
