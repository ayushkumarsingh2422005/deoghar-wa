import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ReviewsClient from './ReviewsClient';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default async function ReviewsPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    return (
        <DashboardLayout username={session.username as string}>
            <ReviewsClient />
        </DashboardLayout>
    );
}
