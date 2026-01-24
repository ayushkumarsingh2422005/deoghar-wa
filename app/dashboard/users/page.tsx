import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import User from '@/models/User';
import connectDB from '@/lib/db';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

async function getUsers() {
    await connectDB();
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    return users.map(user => ({
        ...user,
        _id: user._id.toString(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    }));
}

export default async function UsersPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const users = await getUsers();

    return (
        <DashboardLayout username={session.username as string}>
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Admin Users
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base">
                    Manage administrator accounts and permissions
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        All Administrators
                        <span className="ml-2 text-sm px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {users.length}
                        </span>
                    </h2>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.map((user) => (
                        <div key={user._id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold uppercase text-lg">
                                    {user.username.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white text-lg">{user.username}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Joined</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
