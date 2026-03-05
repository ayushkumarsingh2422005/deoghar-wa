import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Privacy Policy | Deoghar Police WhatsApp Assistant',
    description:
        'Learn how Deoghar Police WhatsApp Assistant collects, uses, and protects your personal information when you interact with our service.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header Banner */}
            <header className="bg-indigo-700 text-white py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="inline-flex items-center justify-center w-10 h-10 bg-white/20 rounded-full">
                            🔒
                        </span>
                        <span className="text-indigo-200 text-sm font-semibold uppercase tracking-widest">
                            Legal
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
                    <p className="text-indigo-200 text-base">
                        Last updated: March 5, 2026
                    </p>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-8 space-y-8">

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Introduction</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Welcome to the <strong>Deoghar Police WhatsApp Assistant</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you interact with our WhatsApp chatbot service operated on behalf of Deoghar Police. Please read this policy carefully. If you do not agree with the terms of this Privacy Policy, please discontinue use of the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Information We Collect</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                            When you interact with our WhatsApp chatbot, we may collect:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                            <li><strong>Phone Number:</strong> Your WhatsApp phone number used to communicate with the bot.</li>
                            <li><strong>Message Content:</strong> The contents of messages you send to the chatbot, including complaints, inquiries, and feedback.</li>
                            <li><strong>Complaint Details:</strong> Information voluntarily provided when filing a complaint, such as incident description, location, and date.</li>
                            <li><strong>Chat History:</strong> A record of your conversation with the assistant to provide context-aware responses.</li>
                            <li><strong>Reviews & Feedback:</strong> Any ratings or feedback you submit regarding police services.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. How We Use Your Information</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                            <li>Provide and operate the WhatsApp assistant service.</li>
                            <li>Process and respond to complaints filed through the chatbot.</li>
                            <li>Improve the accuracy and quality of automated responses.</li>
                            <li>Share relevant information (e.g., traffic rules, emergency contacts, police station locations).</li>
                            <li>Maintain records for administrative and law-enforcement purposes as permitted by law.</li>
                            <li>Monitor service quality and analyse usage patterns to improve the service.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Sharing of Information</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            We do <strong>not</strong> sell or rent your personal information to third parties. We may share your information with:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mt-3">
                            <li><strong>Deoghar Police Officers</strong> for the purpose of processing complaints and inquiries.</li>
                            <li><strong>WhatsApp / Meta:</strong> As required by the WhatsApp Business API platform under Meta&apos;s own terms and privacy policy.</li>
                            <li><strong>Legal Authorities:</strong> When required by applicable law, court order, or governmental regulation.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Data Retention</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            We retain your personal information for as long as necessary to fulfil the purposes described in this policy, or as required by applicable law. Chat histories and complaint records are retained for a period of <strong>2 years</strong> after your last interaction, after which they are securely deleted unless retention is required by law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Data Security</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. All data is stored in secured databases with access restricted to authorised personnel only. However, no method of transmission over the internet or electronic storage is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">7. Your Rights</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                            Depending on applicable law, you may have the right to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                            <li>Access the personal data we hold about you.</li>
                            <li>Request correction of inaccurate data.</li>
                            <li>Request deletion of your personal data (see our <Link href="/data-deletion" className="text-indigo-600 dark:text-indigo-400 underline hover:no-underline">User Data Deletion</Link> page).</li>
                            <li>Object to or restrict certain processing of your data.</li>
                        </ul>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
                            To exercise any of these rights, please contact us at the details listed below.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">8. Third-Party Services</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            This service operates via the <strong>WhatsApp Business API</strong> provided by Meta Platforms, Inc. Your use of WhatsApp is also subject to <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline hover:no-underline">WhatsApp&apos;s Privacy Policy</a>. We are not responsible for the privacy practices of Meta or WhatsApp.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">9. Changes to This Policy</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated &ldquo;Last updated&rdquo; date. We encourage you to review this page periodically.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">10. Contact Us</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            If you have any questions or concerns regarding this Privacy Policy, please contact us:
                        </p>
                        <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg text-slate-700 dark:text-slate-300 space-y-1">
                            <p><strong>Deoghar Police</strong></p>
                            <p>Deoghar, Jharkhand, India</p>
                            <p>Email: <a href="mailto:deoghar.police@jharkhand.gov.in" className="text-indigo-600 dark:text-indigo-400 underline">deoghar.police@jharkhand.gov.in</a></p>
                        </div>
                    </section>
                </div>

                {/* Footer links */}
                <div className="flex flex-wrap gap-4 justify-center mt-8 text-sm text-slate-500 dark:text-slate-400">
                    <Link href="/terms-of-service" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</Link>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <Link href="/data-deletion" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">User Data Deletion</Link>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Dashboard</Link>
                </div>
            </main>
        </div>
    );
}
