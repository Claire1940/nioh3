'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function PrivacyPolicyPage() {
  const t = useTranslations('privacy');
  const tc = useTranslations('common');

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-8 border border-gray-700">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-[#F4B860] hover:text-[#D99B3C] transition-colors mb-4 inline-block"
          >
            ← {tc('home')}
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p className="text-gray-300 mb-4">
              Welcome to nioh3.org ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website nioh3.org.
            </p>
            <p className="text-gray-300">
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">2.1 Automatically Collected Information</h3>
            <p className="text-gray-300 mb-3">
              When you visit our website, we automatically collect certain information about your device, including:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>IP address</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
              <li>Device type and screen resolution</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">2.2 Analytics Data</h3>
            <p className="text-gray-300 mb-4">
              We use third-party analytics services including Google Analytics, Microsoft Clarity, and Ahrefs Analytics to understand how visitors use our site. These services may collect:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Page views and session duration</li>
              <li>Click patterns and user interactions</li>
              <li>Technical information about your device and browser</li>
              <li>Geographic location (country/region level)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-300 mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Improve and optimize our website performance</li>
              <li>Understand how users interact with our content</li>
              <li>Analyze traffic patterns and user behavior</li>
              <li>Debug technical issues and improve user experience</li>
              <li>Generate analytics and reports for internal use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Third-Party Services</h2>
            <p className="text-gray-300 mb-4">
              We use the following third-party services that may collect information:
            </p>

            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white mb-2">Google Analytics</h3>
              <p className="text-gray-300 mb-2">
                We use Google Analytics to track and analyze website traffic. Google Analytics may use cookies and similar technologies to collect information about your use of the website.
              </p>
              <p className="text-gray-300">
                Learn more: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#F4B860] hover:underline">Google Privacy Policy</a>
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white mb-2">Microsoft Clarity</h3>
              <p className="text-gray-300 mb-2">
                We use Microsoft Clarity to understand how users interact with our website through session recordings and heatmaps.
              </p>
              <p className="text-gray-300">
                Learn more: <a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener noreferrer" className="text-[#F4B860] hover:underline">Microsoft Privacy Policy</a>
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white mb-2">Ahrefs Analytics</h3>
              <p className="text-gray-300 mb-2">
                We use Ahrefs Analytics for SEO and traffic analysis.
              </p>
              <p className="text-gray-300">
                Learn more: <a href="https://ahrefs.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#F4B860] hover:underline">Ahrefs Privacy Policy</a>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Cookies and Tracking Technologies</h2>
            <p className="text-gray-300 mb-4">
              We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
            </p>
            <p className="text-gray-300 mb-4">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Data Security</h2>
            <p className="text-gray-300 mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information. However, please note that no method of transmission over the Internet or method of electronic storage is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">7. Your Privacy Rights</h2>
            <p className="text-gray-300 mb-3">
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>The right to access your personal information</li>
              <li>The right to request correction of inaccurate data</li>
              <li>The right to request deletion of your data</li>
              <li>The right to object to processing of your data</li>
              <li>The right to data portability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
            <p className="text-gray-300 mb-4">
              Our website does not knowingly collect personal information from children under 13 years of age. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Privacy Policy</h2>
            <p className="text-gray-300 mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
            <p className="text-gray-300 mb-4">
              If you have any questions about this Privacy Policy, please contact us through our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">11. Disclaimer</h2>
            <p className="text-gray-300 mb-4">
              nioh3.org is an unofficial community guide site and is not affiliated with, endorsed by, or connected to Team Ninja or Koei Tecmo. All game-related content, trademarks, and copyrights are property of their respective owners.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-6 border-t border-gray-700">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <Link
              href="/"
              className="text-[#F4B860] hover:text-[#D99B3C] transition-colors"
            >
              ← Back to Home
            </Link>
            <Link
              href="/terms"
              className="text-[#F4B860] hover:text-[#D99B3C] transition-colors"
            >
              View Terms of Service →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
