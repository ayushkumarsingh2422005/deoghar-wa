import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
    children: ReactNode;
    username: string;
}

export default function DashboardLayout({ children, username }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Sidebar username={username} />

            {/* Main Content Area */}
            <main className="ml-64 min-h-screen">
                <div className="p-6 md:p-8 lg:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
