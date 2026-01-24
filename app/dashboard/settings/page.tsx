import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { CheckCircle2, Activity, Settings } from 'lucide-react';

export default async function SettingsPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    return (
        <DashboardLayout username={session.username as string}>
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Settings
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base">
                    Configure your WhatsApp integration and application settings
                </p>
            </div>

            <div className="space-y-6">
                {/* WhatsApp Configuration */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                        WhatsApp Configuration
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Auto-Reply Status</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Automatically respond to incoming messages</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                Active
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Webhook Status</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Receiving messages from WhatsApp</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                Connected
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coming Soon */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                        Additional Settings
                    </h2>
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-4">
                            <Settings className="w-8 h-8" />
                        </div>
                        <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            More settings coming soon
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">
                            We are working on adding more configuration options
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
