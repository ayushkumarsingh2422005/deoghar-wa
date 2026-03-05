import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Terms of Service | Deoghar Police WhatsApp Assistant',
    description:
        'Read the Terms of Service governing your use of the Deoghar Police WhatsApp Assistant.',
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header Banner */}
            <header className="bg-slate-800 text-white py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="inline-flex items-center justify-center w-10 h-10 bg-white/20 rounded-full">
                            📋
                        </span>
                        <span className="text-slate-300 text-sm font-semibold uppercase tracking-widest">
                            Legal
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
                    <p className="text-slate-300 text-base">
                        Last updated: March 5, 2026
                    </p>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-8 space-y-8">

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            By accessing or using the <strong>Deoghar Police WhatsApp Assistant</strong> (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please discontinue use of the Service immediately. These Terms apply to all users who interact with the chatbot via WhatsApp.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Description of Service</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            The Service is a WhatsApp-based chatbot operated by Deoghar Police that provides citizens with the ability to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mt-3">
                            <li>File complaints and inquiries with Deoghar Police.</li>
                            <li>Access information about police stations, emergency contacts, and traffic regulations.</li>
                            <li>Receive automated responses and guidance on public safety topics.</li>
                            <li>Submit feedback and reviews about police services.</li>
                        </ul>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
                            The Service is intended to supplement, not replace, direct communication with law enforcement. For emergencies, always call <strong>100</strong> (Police) or <strong>112</strong> (National Emergency).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Eligibility</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            You must be at least 18 years old to use this Service, or use it under the supervision of a parent or legal guardian. By using the Service, you represent that you meet this eligibility requirement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Acceptable Use</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                            You agree <strong>not</strong> to use the Service to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                            <li>Submit false, misleading, or fraudulent complaints or information.</li>
                            <li>Harass, threaten, or abuse police personnel or other individuals.</li>
                            <li>Attempt to disrupt, overload, or hack the Service or its underlying systems.</li>
                            <li>Use automated bots or scripts to interact with the chatbot.</li>
                            <li>Violate any applicable local, state, national, or international law or regulation.</li>
                            <li>Impersonate any person or entity, including law enforcement officials.</li>
                        </ul>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
                            Misuse of the Service may result in your number being blocked and, where applicable, legal action being taken.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Accuracy of Information</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            While we strive to provide accurate and up-to-date information, the Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. Deoghar Police does not warrant the completeness, accuracy, reliability, or timeliness of any information provided through the chatbot. Always verify critical information through official channels.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Intellectual Property</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            All content, design, and technology comprising the Service, including but not limited to text, graphics, logos, and software, are the property of Deoghar Police or its licensors and are protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">7. Privacy</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Your use of the Service is also governed by our{' '}
                            <Link href="/privacy-policy" className="text-indigo-600 dark:text-indigo-400 underline hover:no-underline">
                                Privacy Policy
                            </Link>
                            , which is incorporated into these Terms by reference. Please review the Privacy Policy to understand our practices.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">8. Limitation of Liability</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            To the fullest extent permitted by law, Deoghar Police and its officers, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of, or inability to use, the Service. This includes, without limitation, any loss of data, revenue, or goodwill.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">9. Modifications to the Service</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">10. Changes to These Terms</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            We reserve the right to update these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Service after any changes constitutes your acceptance of the new Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">11. Governing Law</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            These Terms shall be governed by and construed in accordance with the laws of <strong>India</strong>, specifically the Information Technology Act, 2000, and other applicable statutes. Any disputes shall be subject to the exclusive jurisdiction of the courts of Deoghar, Jharkhand.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">12. Contact Us</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            If you have any questions about these Terms, please contact us:
                        </p>
                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 space-y-1">
                            <p><strong>Deoghar Police</strong></p>
                            <p>Deoghar, Jharkhand, India</p>
                            <p>Email: <a href="mailto:deoghar.police@jharkhand.gov.in" className="text-indigo-600 dark:text-indigo-400 underline">deoghar.police@jharkhand.gov.in</a></p>
                        </div>
                    </section>
                </div>

                {/* Footer links */}
                <div className="flex flex-wrap gap-4 justify-center mt-8 text-sm text-slate-500 dark:text-slate-400">
                    <Link href="/privacy-policy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</Link>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <Link href="/data-deletion" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">User Data Deletion</Link>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Dashboard</Link>
                </div>
            </main>
        </div>
    );
}
