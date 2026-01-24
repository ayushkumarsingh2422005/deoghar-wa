'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import {
    LayoutDashboard,
    MessageSquare,
    FlaskConical,
    Users,
    Settings,
    LogOut,
    ChevronRight
} from 'lucide-react';

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'WhatsApp Chats', href: '/dashboard/chats', icon: MessageSquare },
    { name: 'Test WhatsApp', href: '/dashboard/test-whatsapp', icon: FlaskConical },
    { name: 'Police Stations', href: '/dashboard/police-stations', icon: LayoutDashboard },
    { name: 'Traffic Rules', href: '/dashboard/traffic-rules', icon: Settings },
    { name: 'Complaints', href: '/dashboard/complaints', icon: MessageSquare },
    { name: 'Resources', href: '/dashboard/resources', icon: Settings },
    { name: 'Admin Users', href: '/dashboard/users', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface SidebarProps {
    username: string;
}

export default function Sidebar({ username }: SidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
            {/* Logo/Brand */}
            <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        D
                    </div>
                    <div>
                        <h1 className="font-bold text-base text-slate-900 dark:text-white">
                            Dashboard
                        </h1>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 overflow-y-auto">
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    group flex items-center justify-between px-3 py-2.5 transition-colors
                                    ${active
                                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-600 dark:border-indigo-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white border-l-2 border-transparent'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-5 h-5 ${active ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                                    <span className={`text-sm font-medium ${active ? 'font-semibold' : ''}`}>
                                        {item.name}
                                    </span>
                                </div>
                                {active && (
                                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* User Profile & Logout */}
            <div className="border-t border-slate-200 dark:border-slate-800">
                <div className="p-4">
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-semibold text-sm uppercase">
                            {username.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                                {username}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Administrator
                            </p>
                        </div>
                    </div>
                    <form action={logout}>
                        <button
                            type="submit"
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </aside>
    );
}
