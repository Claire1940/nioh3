'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-300 mb-4">
              By accessing and using nioh3.org (the "Site"), you accept and agree to be bound by and comply with these Terms of Service. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Use License</h2>
            <p className="text-gray-300 mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on nioh3.org for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on the Site</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">3. Disclaimer</h2>
            <p className="text-gray-300 mb-4">
              The materials on nioh3.org are provided on an 'as is' basis. nioh3.org makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Limitations</h2>
            <p className="text-gray-300 mb-4">
              In no event shall nioh3.org or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on nioh3.org.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Accuracy of Materials</h2>
            <p className="text-gray-300 mb-4">
              The materials appearing on nioh3.org could include technical, typographical, or photographic errors. nioh3.org does not warrant that any of the materials on the Site are accurate, complete, or current. nioh3.org may make changes to the materials contained on the Site at any time without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Links</h2>
            <p className="text-gray-300 mb-4">
              nioh3.org has not reviewed all of the sites linked to its Site and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by nioh3.org of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">7. Modifications</h2>
            <p className="text-gray-300 mb-4">
              nioh3.org may revise these Terms of Service for the Site at any time without notice. By using the Site, you are agreeing to be bound by the then current version of these Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Governing Law</h2>
            <p className="text-gray-300 mb-4">
              These Terms of Service and any separate agreements we may enter into to provide you with services shall be governed by and construed in accordance with the laws of the jurisdiction in which the operator resides.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">9. Fan Site Disclaimer</h2>
            <p className="text-gray-300 mb-4">
              nioh3.org is an unofficial community guide and is not affiliated with, endorsed by, or connected to Team Ninja or Koei Tecmo. All game-related content, trademarks, and copyrights are property of their respective owners.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">10. User Generated Content</h2>
            <p className="text-gray-300 mb-4">
              Any content provided by users on this Site is for informational purposes only. We do not endorse user-generated content and are not responsible for any claims, damages, or losses resulting from user contributions.
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
              href="/privacy"
              className="text-[#F4B860] hover:text-[#D99B3C] transition-colors"
            >
              View Privacy Policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
