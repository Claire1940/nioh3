'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { LiteYouTube } from '@/components/LiteYouTube';
import { AdBanner } from '@/components/AdBanner';
import { ResponsiveAdBanner } from '@/components/ResponsiveAdBanner';
import { useEffect, useState } from 'react';
import { NativeBannerWrapper } from '@/components/NativeBannerWrapper';
import { SocialBarWrapper } from '@/components/SocialBarWrapper';

interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
}

interface RedditPost {
  id?: string;
  title: string;
  description?: string;
  url: string;
}

export default function HomePage() {
  const t = useTranslations('home');
  const tc = useTranslations('common');
  const tcl = useTranslations('coreLinks');
  const tf = useTranslations('faq');
  const tm = useTranslations('meta');

  const [videos, setVideos] = useState<Video[]>([]);
  const [reddit, setReddit] = useState<RedditPost[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch('/data/nioh3-videos.json')
      .then(res => res.json())
      .then(data => setVideos(data.videos || []))
      .catch(err => console.error('Failed to load videos:', err));

    fetch('/data/nioh3-reddit.json')
      .then(res => res.json())
      .then(data => setReddit(data.discussions || []))
      .catch(err => console.error('Failed to load reddit:', err));
  }, []);

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://www.nioh3.org/#website',
        url: 'https://www.nioh3.org',
        name: 'Nioh 3 Wiki',
        description: tm('defaultDescription'),
        publisher: {
          '@id': 'https://www.nioh3.org/#organization'
        }
      },
      {
        '@type': 'Organization',
        '@id': 'https://www.nioh3.org/#organization',
        name: 'nioh3.org',
        url: 'https://www.nioh3.org'
      },
      {
        '@type': 'WebPage',
        '@id': 'https://www.nioh3.org/#webpage',
        url: 'https://www.nioh3.org',
        name: tm('defaultTitle'),
        isPartOf: {
          '@id': 'https://www.nioh3.org/#website'
        },
        about: {
          '@id': 'https://www.nioh3.org/#organization'
        },
        description: tm('defaultDescription')
      }
    ]
  };

  const coreLinks = [
    {
      title: tcl('link1Title'),
      subtitle: tcl('link1Desc'),
      button: tcl('link1Button'),
      url: "/guides/walkthrough"
    },
    {
      title: tcl('link2Title'),
      subtitle: tcl('link2Desc'),
      button: tcl('link2Button'),
      url: "/lore/ending"
    },
    {
      title: tcl('link3Title'),
      subtitle: tcl('link3Desc'),
      button: tcl('link3Button'),
      url: "/guides/tips-tricks"
    },
    {
      title: tcl('link4Title'),
      subtitle: tcl('link4Desc'),
      button: tcl('link4Button'),
      url: "/guides/beginner-guide"
    },
    {
      title: tcl('link5Title'),
      subtitle: tcl('link5Desc'),
      button: tcl('link5Button'),
      url: "/world/yokai"
    },
    {
      title: tcl('link6Title'),
      subtitle: tcl('link6Desc'),
      button: tcl('link6Button'),
      url: "/guides/tips-tricks"
    }
  ];

  const faqs = [
    { question: tf('q1'), answer: tf('a1') },
    { question: tf('q2'), answer: tf('a2') },
    { question: tf('q3'), answer: tf('a3') },
    { question: tf('q4'), answer: tf('a4') },
    { question: tf('q5'), answer: tf('a5') },
    { question: tf('q6'), answer: tf('a6') },
    { question: tf('q7'), answer: tf('a7') },
    { question: tf('q8'), answer: tf('a8') },
    { question: tf('q9'), answer: tf('a9') },
    { question: tf('q10'), answer: tf('a10') }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto py-12">
        <div className="max-w-7xl mx-auto">
          {/* Ad Position 0: 页面顶部粘性 - 320×50 */}
          <div className="sticky top-0 z-50 mb-4">
            <AdBanner type="banner-320x50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 主内容区 - 8列 */}
            <div className="lg:col-span-8">
              {/* Hero Section */}
              <section className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16 overflow-hidden rounded-2xl">

          <div className="relative z-10 flex flex-col justify-center p-8 lg:p-12">
            <h1 className="text-5xl lg:text-6xl font-bold text-white drop-shadow-lg mb-4">
              {t('heroTitle')}
            </h1>
            <h2 className="text-xl lg:text-2xl text-gray-200 drop-shadow-md mb-6">
              {t('heroSubtitle')}
            </h2>
            <p className="text-base lg:text-lg text-gray-300 mb-4 leading-relaxed">
              {t('heroDescription1')}
            </p>
            <p className="text-base lg:text-lg text-gray-300 mb-4 leading-relaxed">
              {t('heroDescription2')}
            </p>
            <p className="text-sm text-gray-400 mb-8">
              {t('trustNote')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/guides/walkthrough"
                className="bg-[#D13B2F] hover:bg-[#E0493D] text-white font-semibold py-3 px-6 rounded-md transition-colors shadow-lg"
                aria-label={t('primaryCTA')}
              >
                {t('primaryCTA')}
              </Link>
              <Link
                href="/builds/best-build"
                className="bg-[#C9A24A] hover:bg-[#D4AE5C] text-[#0B0B0E] font-semibold py-3 px-6 rounded-md transition-colors shadow-lg"
                aria-label={t('secondaryCTA')}
              >
                {t('secondaryCTA')}
              </Link>
            </div>
          </div>
          <div className="relative z-10 flex items-center justify-center lg:justify-end p-8 lg:p-12">
            <div className="relative w-full max-w-2xl">
              <Image
                src="/images/hero.webp"
                alt="Nioh 3 - Action RPG Game"
                width={616}
                height={353}
                priority
                placeholder="empty"
                className="rounded-lg shadow-2xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

              {/* Ad Position 1: Hero Section下方 - Native Banner */}
              <NativeBannerWrapper className="my-8" />

              {/* Core Links Section (6 cards) */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold text-center text-white mb-4">{t('coreLinksTitle')}</h2>
                <p className="text-center text-gray-300 mb-8">{t('coreLinksSub')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coreLinks.map((item, index) => (
                    <div key={index} className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] hover:ring-4 hover:ring-[#F4B860]/30 rounded-lg p-6 border border-gray-700 transition-all h-full flex flex-col">
                      <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-300 mb-4 flex-1">{item.subtitle}</p>
                      <Link
                        href={item.url}
                        className="inline-block bg-[#F4B860] hover:bg-[#D99B3C] text-black font-semibold py-2 px-4 rounded text-center transition-colors"
                      >
                        {item.button}
                      </Link>
                    </div>
                  ))}
                </div>
              </section>

              {/* Ad Position 2: Core Links 下方 - 320×50 */}
              <AdBanner type="banner-320x50" className="my-8" />

              {/* Ad Position 3: Core Links Section下方 - 响应式广告 (移动端 320x50, 桌面端 728x90) */}
              <ResponsiveAdBanner className="my-8" />

              {/* YouTube Videos Section */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold text-center text-white mb-4 flex items-center justify-center gap-3">
                  {t('mustWatchTitle')}
                </h2>
                <p className="text-center text-gray-400 mb-8 max-w-3xl mx-auto">
                  {t('mustWatchDesc')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {videos.map((video, index) => (
                    <LiteYouTube
                      key={index}
                      videoId={video.id}
                      title={video.title}
                      description={video.description}
                    />
                  ))}
                </div>
              </section>

              {/* Ad Position 4: TOP 10 Keywords 前 - 320×50 */}
              <AdBanner type="banner-320x50" className="my-8" />

              {/* ==================== TOP 10 关键词模块 ==================== */}
              <section className="mb-16">
                <h2 className="text-4xl font-bold text-center text-white mb-2">{t('topKeywords')}</h2>
                <p className="text-center text-gray-400 mb-12 max-w-3xl mx-auto">Explore the 10 most-searched Nioh 3 topics—from guides to builds to strategies</p>

                <div className="space-y-12">
                  {/* Module 1: Spoilers */}
                  <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-8 border border-gray-700">
                    <h3 className="text-2xl font-semibold text-white mb-3">{t('module1Title')}</h3>
                    <p className="text-gray-300 mb-6">{t('module1Sub')}</p>
                    <ul className="space-y-2 mb-6">
                      <li className="text-gray-300">✓ {t('module1Item1')}</li>
                      <li className="text-gray-300">✓ {t('module1Item2')}</li>
                      <li className="text-gray-300">✓ {t('module1Item3')}</li>
                      <li className="text-gray-300">✓ {t('module1Item4')}</li>
                      <li className="text-gray-300">✓ {t('module1Item5')}</li>
                    </ul>
                    <div className="bg-[#2D1C16] rounded p-4 mb-6 border border-[#F4B860]/30">
                      <p className="text-[#F4B860] font-semibold mb-2">{t('module1Highlight')}</p>
                      <p className="text-gray-300 text-sm">{t('module1HighlightText')}</p>
                    </div>
                    <Link href="/guides/walkthrough" className="inline-block bg-[#F4B860] hover:bg-[#D99B3C] text-black font-bold py-2 px-6 rounded transition-colors">
                      {t('module1CTA')} →
                    </Link>
                  </div>

                  {/* Module 2: All Endings */}
                  <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-8 border border-gray-700">
                    <h3 className="text-2xl font-semibold text-white mb-3">{t('module2Title')}</h3>
                    <p className="text-gray-300 mb-6">{t('module2Sub')}</p>
                    <ul className="space-y-2 mb-6">
                      <li className="text-gray-300">✓ {t('module2Item1')}</li>
                      <li className="text-gray-300">✓ {t('module2Item2')}</li>
                      <li className="text-gray-300">✓ {t('module2Item3')}</li>
                      <li className="text-gray-300">✓ {t('module2Item4')}</li>
                      <li className="text-gray-300">✓ {t('module2Item5')}</li>
                    </ul>
                    <div className="bg-[#2D1C16] rounded p-4 mb-6 border border-[#F4B860]/30">
                      <p className="text-[#F4B860] font-semibold">{t('module2Highlight')}</p>
                    </div>
                    <Link href="/lore/ending" className="inline-block bg-[#F4B860] hover:bg-[#D99B3C] text-black font-bold py-2 px-6 rounded transition-colors">
                      {t('module2CTA')} →
                    </Link>
                  </div>

                  {/* Module 3: Night Shift Survival */}
                  <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-8 border border-gray-700">
                    <h3 className="text-2xl font-semibold text-white mb-3">{t('module3Title')}</h3>
                    <p className="text-gray-300 mb-6">{t('module3Sub')}</p>
                    <ul className="space-y-2 mb-6">
                      <li className="text-gray-300">✓ {t('module3Item1')}</li>
                      <li className="text-gray-300">✓ {t('module3Item2')}</li>
                      <li className="text-gray-300">✓ {t('module3Item3')}</li>
                      <li className="text-gray-300">✓ {t('module3Item4')}</li>
                      <li className="text-gray-300">✓ {t('module3Item5')}</li>
                    </ul>
                    <div className="bg-[#2D1C16] rounded p-4 mb-6 border border-[#F4B860]/30">
                      <p className="text-[#F4B860] font-semibold">{t('module3Highlight')}</p>
                    </div>
                    <Link href="/guides/tips-tricks" className="inline-block bg-[#F4B860] hover:bg-[#D99B3C] text-black font-bold py-2 px-6 rounded transition-colors">
                      {t('module3CTA')} →
                    </Link>
                  </div>

                  {/* Module 4: Haunted Supermarket */}
                  <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-8 border border-gray-700">
                    <h3 className="text-2xl font-semibold text-white mb-3">{t('module4Title')}</h3>
                    <p className="text-gray-300 mb-6">{t('module4Sub')}</p>
                    <ul className="space-y-2 mb-6">
                      <li className="text-gray-300">✓ {t('module4Item1')}</li>
                      <li className="text-gray-300">✓ {t('module4Item2')}</li>
                      <li className="text-gray-300">✓ {t('module4Item3')}</li>
                      <li className="text-gray-300">✓ {t('module4Item4')}</li>
                      <li className="text-gray-300">✓ {t('module4Item5')}</li>
                    </ul>
                    <div className="bg-[#2D1C16] rounded p-4 mb-6 border border-[#F4B860]/30">
                      <p className="text-[#F4B860] font-semibold">{t('module4Highlight')}</p>
                    </div>
                    <Link href="/community/wiki" className="inline-block bg-[#F4B860] hover:bg-[#D99B3C] text-black font-bold py-2 px-6 rounded transition-colors">
                      {t('module4CTA')} →
                    </Link>
                  </div>

                  {/* Module 5: All Jumpscares */}
                  <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-8 border border-gray-700">
                    <h3 className="text-2xl font-semibold text-white mb-3">{t('module5Title')}</h3>
                    <p className="text-gray-300 mb-6">{t('module5Sub')}</p>
                    <ul className="space-y-2 mb-6">
                      <li className="text-gray-300">✓ {t('module5Item1')}</li>
                      <li className="text-gray-300">✓ {t('module5Item2')}</li>
                      <li className="text-gray-300">✓ {t('module5Item3')}</li>
                      <li className="text-gray-300">✓ {t('module5Item4')}</li>
                      <li className="text-gray-300">✓ {t('module5Item5')}</li>
                    </ul>
                    <div className="bg-[#2D1C16] rounded p-4 mb-6 border border-[#F4B860]/30">
                      <p className="text-[#F4B860] font-semibold">{t('module5Highlight')}</p>
                    </div>
                    <Link href="/guides/secrets" className="inline-block bg-[#F4B860] hover:bg-[#D99B3C] text-black font-bold py-2 px-6 rounded transition-colors">
                      {t('module5CTA')} →
                    </Link>
                  </div>

                  {/* Module 6: Monsters & Entities */}
                  <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-8 border border-gray-700">
                    <h3 className="text-2xl font-semibold text-white mb-3">{t('module6Title')}</h3>
                    <p className="text-gray-300 mb-6">{t('module6Sub')}</p>
                    <ul className="space-y-2 mb-6">
                      <li className="text-gray-300">✓ {t('module6Item1')}</li>
                      <li className="text-gray-300">✓ {t('module6Item2')}</li>
                      <li className="text-gray-300">✓ {t('module6Item3')}</li>
                      <li className="text-gray-300">✓ {t('module6Item4')}</li>
                      <li className="text-gray-300">✓ {t('module6Item5')}</li>
                    </ul>
                    <div className="bg-[#2D1C16] rounded p-4 mb-6 border border-[#F4B860]/30">
                      <p className="text-[#F4B860] font-semibold">{t('module6Highlight')}</p>
                    </div>
                    <Link href="/world/yokai" className="inline-block bg-[#F4B860] hover:bg-[#D99B3C] text-black font-bold py-2 px-6 rounded transition-colors">
                      {t('module6CTA')} →
                    </Link>
                  </div>

                  {/* Module 7: Freezer Section */}
                  <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-8 border border-gray-700">
                    <h3 className="text-2xl font-semibold text-white mb-3">{t('module7Title')}</h3>
                    <p className="text-gray-300 mb-6">{t('module7Sub')}</p>
                    <ul className="space-y-2 mb-6">
                      <li className="text-gray-300">✓ {t('module7Item1')}</li>
                      <li className="text-gray-300">✓ {t('module7Item2')}</li>
                      <li className="text-gray-300">✓ {t('module7Item3')}</li>
                      <li className="text-gray-300">✓ {t('module7Item4')}</li>
                      <li className="text-gray-300">✓ {t('module7Item5')}</li>
                    </ul>
                    <div className="bg-[#2D1C16] rounded p-4 mb-6 border border-[#F4B860]/30">
                      <p className="text-[#F4B860] font-semibold">{t('module7Highlight')}</p>
                    </div>
                    <Link href="/guides/secrets" className="inline-block bg-[#F4B860] hover:bg-[#D99B3C] text-black font-bold py-2 px-6 rounded transition-colors">
                      {t('module7CTA')} →
                    </Link>
                  </div>

                  {/* Module 8: Customer Service Horror */}
                  <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-8 border border-gray-700">
                    <h3 className="text-2xl font-semibold text-white mb-3">{t('module8Title')}</h3>
                    <p className="text-gray-300 mb-6">{t('module8Sub')}</p>
                    <ul className="space-y-2 mb-6">
                      <li className="text-gray-300">✓ {t('module8Item1')}</li>
                      <li className="text-gray-300">✓ {t('module8Item2')}</li>
                      <li className="text-gray-300">✓ {t('module8Item3')}</li>
                      <li className="text-gray-300">✓ {t('module8Item4')}</li>
                      <li className="text-gray-300">✓ {t('module8Item5')}</li>
                    </ul>
                    <div className="bg-[#2D1C16] rounded p-4 mb-6 border border-[#F4B860]/30">
                      <p className="text-[#F4B860] font-semibold">{t('module8Highlight')}</p>
                    </div>
                    <Link href="/world/yokai" className="inline-block bg-[#F4B860] hover:bg-[#D99B3C] text-black font-bold py-2 px-6 rounded transition-colors">
                      {t('module8CTA')} →
                    </Link>
                  </div>

                  {/* Module 9: All Bosses */}
                  <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-8 border border-gray-700">
                    <h3 className="text-2xl font-semibold text-white mb-3">{t('module9Title')}</h3>
                    <p className="text-gray-300 mb-6">{t('module9Sub')}</p>
                    <ul className="space-y-2 mb-6">
                      <li className="text-gray-300">✓ {t('module9Item1')}</li>
                      <li className="text-gray-300">✓ {t('module9Item2')}</li>
                      <li className="text-gray-300">✓ {t('module9Item3')}</li>
                      <li className="text-gray-300">✓ {t('module9Item4')}</li>
                      <li className="text-gray-300">✓ {t('module9Item5')}</li>
                    </ul>
                    <div className="bg-[#2D1C16] rounded p-4 mb-6 border border-[#F4B860]/30">
                      <p className="text-[#F4B860] font-semibold">{t('module9Highlight')}</p>
                    </div>
                    <Link href="/combat/combat-guide" className="inline-block bg-[#F4B860] hover:bg-[#D99B3C] text-black font-bold py-2 px-6 rounded transition-colors">
                      {t('module9CTA')} →
                    </Link>
                  </div>

                  {/* Module 10: Similar Games */}
                  <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-8 border border-gray-700">
                    <h3 className="text-2xl font-semibold text-white mb-3">{t('module10Title')}</h3>
                    <p className="text-gray-300 mb-6">{t('module10Sub')}</p>
                    <ul className="space-y-2 mb-6">
                      <li className="text-gray-300">✓ {t('module10Item1')}</li>
                      <li className="text-gray-300">✓ {t('module10Item2')}</li>
                      <li className="text-gray-300">✓ {t('module10Item3')}</li>
                      <li className="text-gray-300">✓ {t('module10Item4')}</li>
                      <li className="text-gray-300">✓ {t('module10Item5')}</li>
                    </ul>
                    <div className="bg-[#2D1C16] rounded p-4 mb-6 border border-[#F4B860]/30">
                      <p className="text-[#F4B860] font-semibold">{t('module10Highlight')}</p>
                    </div>
                    <Link href="/guides/comparison" className="inline-block bg-[#F4B860] hover:bg-[#D99B3C] text-black font-bold py-2 px-6 rounded transition-colors">
                      {t('module10CTA')} →
                    </Link>
                  </div>
                </div>
              </section>

              {/* Ad Position 5: TOP 10 Keywords Section下方 - 300x250 Banner */}
              <AdBanner type="banner-300x250" className="my-8" />

              {/* User Reviews Section */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold text-center text-white mb-4">{t('reviewsTitle')}</h2>
                <p className="text-center text-gray-400 mb-8 max-w-3xl mx-auto">
                  {t('reviewsDesc')}
                </p>
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-6 border border-gray-700">
                    <p className="text-gray-300 mb-4 italic">"{t('review1')}"</p>
                    <p className="text-[#F4B860] text-sm">— r/TwoBestFriendsPlay</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-6 border border-gray-700">
                    <p className="text-gray-300 mb-4 italic">"{t('review2')}"</p>
                    <p className="text-[#F4B860] text-sm">— r/Nioh</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-6 border border-gray-700">
                    <p className="text-gray-300 mb-4 italic">"{t('review3')}"</p>
                    <p className="text-[#F4B860] text-sm">— r/Games</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-6 border border-gray-700">
                    <p className="text-gray-300 mb-4 italic">"{t('review4')}"</p>
                    <p className="text-[#F4B860] text-sm">— r/Nioh</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-6 border border-gray-700">
                    <p className="text-gray-300 mb-4 italic">"{t('review5')}"</p>
                    <p className="text-[#F4B860] text-sm">— r/TwoBestFriendsPlay</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-6 border border-gray-700">
                    <p className="text-gray-300 mb-4 italic">"{t('review6')}"</p>
                    <p className="text-[#F4B860] text-sm">— r/Nioh</p>
                  </div>
                </div>
              </section>

              {/* Reddit Community Discussion */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold text-center text-white mb-4 flex items-center justify-center gap-3">
                  {t('communityTitle')}
                </h2>
                <p className="text-center text-gray-400 mb-8 max-w-3xl mx-auto">
                  {t('communityDesc')}
                </p>
                <div className="max-w-5xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reddit.map((item, index) => (
                      <a
                        key={index}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-6 border border-gray-700 hover:border-orange-500 transition-all"
                      >
                        <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      </a>
                    ))}
                  </div>
                </div>
              </section>

              {/* FAQ Section */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold text-center text-white mb-8">{tf('title')}</h2>

                <div className="max-w-3xl mx-auto space-y-3">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-700/30 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                        <svg
                          className={`w-5 h-5 text-[#F4B860] flex-shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <p className="text-gray-300 px-5 pb-5">{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Ad Position 6: FAQ Section下方 - 响应式广告 (移动端 320x50, 桌面端 728x90) */}
              <ResponsiveAdBanner className="my-8" />

              {/* CTA Section */}
              <section className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-12 text-center border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-4">{t('readyTitle')}</h2>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  {t('readyDesc')}
                </p>
                <Link
                  href="/guides/beginner-guide"
                  className="inline-block bg-[#F4B860] hover:bg-[#D99B3C] text-black font-bold py-3 px-8 rounded-md transition-colors"
                  aria-label={t('readyCTA')}
                >
                  {t('readyCTA')} →
                </Link>
              </section>
            </div>

            {/* 右侧边栏 - 4列 */}
            <aside className="lg:col-span-4">
              <div className="hidden lg:block space-y-6">
                {/* Social Bar - Adsterra 广告位 */}
                <div className="sticky top-20 z-10 mb-8">
                  <SocialBarWrapper />
                </div>

                {/* Ad Position 7: 右侧边栏粘性 - 160×600 */}
                <div className="sticky top-4 z-10 mb-8">
                  <AdBanner type="banner-160x600" />
                </div>

                {/* Ad Position 8: 右侧边栏固定 - 160×300 */}
                <div className="mb-8">
                  <AdBanner type="banner-160x300" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
