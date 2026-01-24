'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Message {
    _id: string;
    phoneNumber: string;
    message: string;
    direction: 'incoming' | 'outgoing';
    timestamp: string;
    status?: string;
}

export default function ChatView({ phoneNumber }: { phoneNumber: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();
    }, [phoneNumber]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/chats/${encodeURIComponent(phoneNumber)}`);
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || sending) return;

        setSending(true);

        try {
            const res = await fetch('/api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: phoneNumber,
                    message: newMessage.trim(),
                }),
            });

            const data = await res.json();

            if (data.success) {
                // Add the new message to the list
                setMessages(prev => [...prev, {
                    _id: data.messageId || Date.now().toString(),
                    phoneNumber,
                    message: newMessage.trim(),
                    direction: 'outgoing',
                    timestamp: new Date().toISOString(),
                    status: 'sent',
                }]);
                setNewMessage('');

                // Optionally refetch to ensure sync
                setTimeout(fetchMessages, 500);
            } else {
                alert(`Failed to send message: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Check console for details.');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                            No messages yet
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.direction === 'outgoing'
                                            ? 'bg-indigo-600 text-white rounded-br-md'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                    <p
                                        className={`text-xs mt-1 ${msg.direction === 'outgoing'
                                                ? 'text-indigo-100'
                                                : 'text-slate-500 dark:text-slate-400'
                                            }`}
                                    >
                                        {new Date(msg.timestamp).toLocaleTimeString(undefined, {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                        {msg.direction === 'outgoing' && msg.status && (
                                            <span className="ml-1">• {msg.status}</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900">
                    <form onSubmit={sendMessage} className="flex gap-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            disabled={sending}
                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                        />
                        <Button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="px-6 flex items-center gap-2"
                        >
                            {sending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send
                                </>
                            )}
                        </Button>
                    </form>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Message will be sent via WhatsApp Cloud API to {phoneNumber}
                    </p>
                </div>
            </div>
        </div>
    );
}
