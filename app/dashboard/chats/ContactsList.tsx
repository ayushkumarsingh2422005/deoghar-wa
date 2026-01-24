'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Contact {
    _id: string;
    phoneNumber: string;
    name?: string;
    lastMessageAt: string;
    unreadCount: number;
}

export default function ContactsList() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const res = await fetch('/api/contacts');
            const data = await res.json();
            if (data.success) {
                setContacts(data.contacts);
            }
        } catch (error) {
            console.error('Error loading contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (contacts.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl">
                    💬
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No conversations yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                    Messages from WhatsApp will appear here once users start chatting.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {contacts.map((contact) => (
                    <Link
                        key={contact._id}
                        href={`/dashboard/chats/${contact.phoneNumber}`}
                        className="block p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                                    {contact.name ? contact.name.charAt(0).toUpperCase() : '👤'}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                        {contact.name || contact.phoneNumber}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {contact.phoneNumber}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
                                    {new Date(contact.lastMessageAt).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                                {contact.unreadCount > 0 && (
                                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-indigo-600 rounded-full">
                                        {contact.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
