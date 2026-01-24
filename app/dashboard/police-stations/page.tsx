import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PoliceStation from '@/models/PoliceStation';
import connectDB from '@/lib/db';
import { MapPin, Phone, User } from 'lucide-react';

async function getPoliceStations() {
    await connectDB();
    const stations = await PoliceStation.find({}).sort({ name: 1 }).lean();
    return stations.map(station => ({
        ...station,
        _id: station._id.toString(),
        createdAt: station.createdAt.toISOString(),
        updatedAt: station.updatedAt.toISOString(),
    }));
}

export default async function PoliceStationsPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const stations = await getPoliceStations();

    return (
        <DashboardLayout username={session.username as string}>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        Police Stations
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base">
                        Manage police stations in Deoghar district
                    </p>
                </div>
                <a
                    href="/dashboard/police-stations/new"
                    className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                    Add New Station
                </a>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        All Police Stations
                        <span className="ml-2 text-sm px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {stations.length}
                        </span>
                    </h2>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stations.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                            No police stations added yet. Click &quot;Add New Station&quot; to create one.
                        </div>
                    ) : (
                        stations.map((station) => (
                            <div
                                key={station._id}
                                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                {station.name}
                                            </h3>
                                            <span className={`px-2 py-0.5 text-xs font-medium ${station.isActive
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {station.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                            {station.nameHindi}
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                                <div>
                                                    <p className="text-slate-900 dark:text-white">{station.address}</p>
                                                    <p className="text-slate-500 text-xs">
                                                        {station.location.coordinates[1]}, {station.location.coordinates[0]}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-slate-400" />
                                                <span className="text-slate-900 dark:text-white">{station.contactNumber}</span>
                                            </div>

                                            {station.inchargeName && (
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    <span className="text-slate-900 dark:text-white">
                                                        {station.inchargeName}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <a
                                            href={`/dashboard/police-stations/edit/${station._id}`}
                                            className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        >
                                            Edit
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
