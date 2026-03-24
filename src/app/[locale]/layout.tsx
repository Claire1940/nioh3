import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import CursorGlow from '@/components/CursorGlow';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: Props): Promise<Metadata> {
  const { locale } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages = await getMessages({ locale }) as any;

  const localeMap: Record<string, string> = {
    'en': 'en_US',
    'ru': 'ru_RU',
    'ja': 'ja_JP',
    'es': 'es_ES',
    'pt': 'pt_BR',
    'de': 'de_DE',
    'fr': 'fr_FR',
    'ko': 'ko_KR'
  };

  return {
    title: {
      default: messages.meta?.defaultTitle || "Nioh 3 Wiki - Complete Guide, Builds, Maps & Boss Strategies | nioh3.org",
      template: "%s | nioh3.org"
    },
    description: messages.meta?.defaultDescription || "Master Nioh 3 with our comprehensive wiki. Discover detailed guides, optimal builds, interactive maps, boss strategies, weapon guides, and hidden secrets for this action RPG.",
    keywords: messages.meta?.keywords?.split(', ') || [
      "nioh 3",
      "nioh 3 wiki",
      "nioh 3 guide",
      "nioh 3 builds",
      "nioh 3 maps",
      "nioh 3 bosses",
      "nioh 3 weapons",
      "nioh 3 skills",
      "nioh 3 walkthrough",
      "nioh 3 tips"
    ],
    authors: [{ name: "nioh3.org Team" }],
    creator: "nioh3.org",
    publisher: "Nioh 3 Wiki",
    metadataBase: new URL('https://www.nioh3.org'),
    alternates: {
      canonical: locale === 'en' ? '/' : `/${locale}`,
      languages: {
        'en': '/',
        'ru': '/ru',
        'ja': '/ja',
        'es': '/es',
        'pt': '/pt',
        'de': '/de',
        'fr': '/fr',
        'ko': '/ko',
        'x-default': '/'
      }
    },
    openGraph: {
      type: 'website',
      locale: localeMap[locale] || 'en_US',
      url: `/${locale}`,
      title: messages.meta?.defaultTitle || 'Nioh 3 Wiki - Complete Guide, Builds, Maps & Boss Strategies',
      description: messages.meta?.defaultDescription || 'Master Nioh 3 with our comprehensive wiki. Discover detailed guides, optimal builds, interactive maps, boss strategies, weapon guides, and hidden secrets for this action RPG.',
      siteName: 'nioh3.org',
      images: [
        {
          url: '/images/hero.webp',
          width: 748,
          height: 896,
          alt: 'Nioh 3 - Action RPG Game',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: messages.meta?.defaultTitle || 'Nioh 3 Wiki - Complete Guide, Builds, Maps & Boss Strategies',
      description: messages.meta?.defaultDescription || 'Master Nioh 3 with our comprehensive wiki. Discover detailed guides, optimal builds, interactive maps, boss strategies, weapon guides, and hidden secrets for this action RPG.',
      images: ['/images/hero.webp'],
      creator: '@nioh3wiki',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;

  // 确保传入的 `locale` 是有效的
  if (!routing.locales.includes(locale as 'en' | 'ru' | 'ja' | 'es' | 'pt' | 'de' | 'fr' | 'ko')) {
    notFound();
  }

  // 为客户端组件提供所有消息
  const messages = await getMessages({ locale });

  // Analytics IDs
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID
  const ahrefsKey = process.env.NEXT_PUBLIC_AHREFS_KEY
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID
  const socialBarKey = process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_KEY
  const popunderKey = process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_KEY

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <head>
        {/* Google AdSense Account Verification */}
        {adsenseId && (
          <meta name="google-adsense-account" content={adsenseId} />
        )}

        {/* Favicons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* DNS Prefetch - 提前解析域名 */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://analytics.ahrefs.com" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />

        {/* Preconnect - 提前建立连接 (DNS + TCP + TLS) */}
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.youtube.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Google Analytics */}
        {gaId && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}

        {/* Microsoft Clarity */}
        {clarityId && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `}
          </Script>
        )}

        {/* Ahrefs Analytics */}
        {ahrefsKey && (
          <Script
            src="https://analytics.ahrefs.com/analytics.js"
            data-key={ahrefsKey}
            async
            strategy="afterInteractive"
          />
        )}

        {/* Google AdSense */}
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}

        {/* Adsterra Popunder 广告 - 放在 </head> 之前 */}
        {popunderKey && (
          <Script
            src={`https://pl28600498.effectivegatecpm.com/${popunderKey}.js`}
            strategy="afterInteractive"
          />
        )}

        <Script
          crossOrigin="anonymous"
          src="https://unpkg.com/same-runtime/dist/index.global.js"
          strategy="afterInteractive"
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <CursorGlow />
          <div className="relative min-h-screen">
            <div className="relative z-10 flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </NextIntlClientProvider>

        {/* Adsterra Social Bar - 放在 </body> 标签之前 */}
        {socialBarKey && (
          <Script
            src={`https://pl28481201.effectivegatecpm.com/${socialBarKey}.js`}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
