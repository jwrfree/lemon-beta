import { redirect } from 'next/navigation';

export default function AssetsLiabilitiesPage() {
    redirect('/wealth?tab=assets');
}
