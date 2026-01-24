import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import User from '@/models/User';
import connectDB from '@/lib/db';
import AdminCreationForm from './AdminCreationForm';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Users, MessageSquare, Zap } from 'lucide-react';

async function getUsers() {
    await connectDB();
    // Return plain objects to avoid serialization issues with Mongoose documents in Server Components
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    return users.map(user => ({
        ...user,
        _id: user._id.toString(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    }));
}

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const users = await getUsers();

    return (
        <DashboardLayout username={session.username as string}>
            {/* Header Section */}
            <section className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Welcome Back, {session.username as string}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base">
                    Manage your WhatsApp integration and admin users from this dashboard.
                </p>
            </section>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Total Admins
                            </p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                                {users.length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                WhatsApp Status
                            </p>
                            <p className="text-base font-semibold text-green-600 dark:text-green-400 mt-1">
                                Connected
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Auto-Reply
                            </p>
                            <p className="text-base font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                                Active
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Management Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create User Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                            Add New Admin
                        </h2>
                        <AdminCreationForm />
                    </div>
                </div>

                {/* User List Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Active Administrators
                                <span className="ml-2 text-sm px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    {users.length}
                                </span>
                            </h2>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {users.map((user) => (
                                <div key={user._id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold uppercase">
                                            {user.username.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">{user.username}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Created</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">
                                            {new Date(user.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
