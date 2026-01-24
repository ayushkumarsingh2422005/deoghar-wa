'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Send, CheckCircle2, XCircle, Info } from 'lucide-react';

interface WhatsAppTestResult {
    success: boolean;
    message?: string;
    whatsappResponse?: {
        messages?: Array<{ id: string }>;
    };
}

export default function TestWhatsAppClient() {
    const [phoneNumber, setPhoneNumber] = useState('918127757516');
    const [message, setMessage] = useState('Hello! This is a test message from the dashboard.');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<WhatsAppTestResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const sendTestMessage = async () => {
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const response = await fetch('/api/test-whatsapp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: phoneNumber,
                    message: message,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setResult(data);
            } else {
                setError(data.error || 'Failed to send message');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Phone Number (with country code, no +)
                        </label>
                        <input
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="918127757516"
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            Example: 918127757516 (India), 14155552671 (US)
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter your test message"
                            rows={4}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <Button
                        onClick={sendTestMessage}
                        disabled={loading || !phoneNumber || !message}
                        className="w-full py-3 text-base flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Send Test Message
                            </>
                        )}
                    </Button>
                </div>

                {result && (
                    <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Message Sent Successfully
                        </h3>
                        <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                            <p>
                                <strong>Phone:</strong> {phoneNumber}
                            </p>
                            <p>
                                <strong>Message ID:</strong> {result.whatsappResponse?.messages?.[0]?.id || 'N/A'}
                            </p>
                        </div>
                        <details className="mt-4">
                            <summary className="cursor-pointer text-sm font-medium text-green-700 dark:text-green-300">
                                View Full Response
                            </summary>
                            <pre className="mt-2 p-4 bg-white dark:bg-slate-800 text-xs overflow-auto border border-green-200 dark:border-green-800">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </details>
                    </div>
                )}

                {error && (
                    <div className="mt-6 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            Error Sending Message
                        </h3>
                        <p className="text-sm text-red-800 dark:text-red-200">
                            {error}
                        </p>
                        <div className="mt-4 p-4 bg-white dark:bg-slate-800 text-xs border border-red-200 dark:border-red-800">
                            <strong>Common Solutions:</strong>
                            <ul className="mt-2 list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                                <li>Check your access token is valid and not expired</li>
                                <li>Verify phone number ID is correct</li>
                                <li>Ensure phone number format is correct (country code, no +)</li>
                                <li>Check console logs for detailed error messages</li>
                                <li>See DEBUGGING_GUIDE.md for more help</li>
                            </ul>
                        </div>
                    </div>
                )}

                <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Important Notes
                    </h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                        <li>Message will be sent through the WhatsApp Cloud API</li>
                        <li>Check your terminal/console for detailed API logs</li>
                        <li>The recipient will receive this as a real WhatsApp message</li>
                        <li>This also tests your database connection (message is saved)</li>
                        <li>You can view sent messages in the Chats section</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
