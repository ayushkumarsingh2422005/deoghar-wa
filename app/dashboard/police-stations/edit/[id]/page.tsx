import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PoliceStationForm from '../../PoliceStationForm';
import connectDB from '@/lib/db';
import PoliceStation from '@/models/PoliceStation';

async function getPoliceStation(id: string) {
    await connectDB();
    const station = await PoliceStation.findById(id).lean();
    if (!station) return null;

    return {
        _id: station._id.toString(),
        name: station.name,
        nameHindi: station.nameHindi,
        address: station.address,
        addressHindi: station.addressHindi,
        district: station.district,
        contactNumber: station.contactNumber,
        inchargeName: station.inchargeName || '',
        inchargeNameHindi: station.inchargeNameHindi || '',
        latitude: station.location.coordinates[1],
        longitude: station.location.coordinates[0],
        isActive: station.isActive,
    };
}

export default async function EditPoliceStationPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const { id } = await params;
    const station = await getPoliceStation(id);

    if (!station) {
        redirect('/dashboard/police-stations');
    }

    return (
        <DashboardLayout username={session.username as string}>
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Edit Police Station
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base">
                    Update police station information
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                <PoliceStationForm initialData={station} />
            </div>
        </DashboardLayout>
    );
}
