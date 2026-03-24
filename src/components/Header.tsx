'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const t = useTranslations('common');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-700/50 bg-black/30 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-5 md:gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-white drop-shadow-md">
              {t('siteName')}
            </span>
          </Link>
          <nav className="hidden lg:flex gap-2 xl:gap-3">
            <Link
              href="/news"
              className="text-sm text-gray-200 hover:text-[#F4B860] transition-colors px-1 py-2 whitespace-nowrap"
            >
              {t('news')}
            </Link>
            <Link
              href="/platforms"
              className="text-sm text-gray-200 hover:text-[#F4B860] transition-colors px-1 py-2 whitespace-nowrap"
            >
              {t('platforms')}
            </Link>
            <Link
              href="/guides"
              className="text-sm text-gray-200 hover:text-[#F4B860] transition-colors px-1 py-2 whitespace-nowrap"
            >
              {t('guides')}
            </Link>
            <Link
              href="/builds"
              className="text-sm text-gray-200 hover:text-[#F4B860] transition-colors px-1 py-2 whitespace-nowrap"
            >
              {t('builds')}
            </Link>
            <Link
              href="/combat"
              className="text-sm text-gray-200 hover:text-[#F4B860] transition-colors px-1 py-2 whitespace-nowrap"
            >
              {t('combat')}
            </Link>
            <Link
              href="/world"
              className="text-sm text-gray-200 hover:text-[#F4B860] transition-colors px-1 py-2 whitespace-nowrap"
            >
              {t('world')}
            </Link>
            <Link
              href="/lore"
              className="text-sm text-gray-200 hover:text-[#F4B860] transition-colors px-1 py-2 whitespace-nowrap"
            >
              {t('lore')}
            </Link>
            <Link
              href="/community"
              className="text-sm text-gray-200 hover:text-[#F4B860] transition-colors px-1 py-2 whitespace-nowrap"
            >
              {t('community')}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/guides"
            className="bg-[#F4B860] hover:bg-[#D99B3C] text-black text-sm font-semibold py-1.5 px-3 rounded-lg transition-colors whitespace-nowrap"
            aria-label={t('getStartedGuide')}
          >
            {t('getStartedGuide')}
          </Link>
        </div>
      </div>
    </header>
  )
}
