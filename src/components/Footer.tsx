'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-muted-foreground border-t">
      <div className="flex flex-col justify-center items-center max-w-7xl text-center mx-auto py-12 px-4 sm:px-6 lg:px-8 lg:text-start">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase">{t('guidesWalkthroughs')}</h3>
            <ul className="mt-4 space-y-4">
              <li><Link href="/guides/beginner-guide" className="text-base hover:text-[#F4B860]">{t('allEndingsGuide')}</Link></li>
              <li><Link href="/guides/walkthrough" className="text-base hover:text-[#F4B860]">{t('completeWalkthrough')}</Link></li>
              <li><Link href="/guides/tips-tricks" className="text-base hover:text-[#F4B860]">{t('beginnerGuide')}</Link></li>
              <li><Link href="/guides/character-creation" className="text-base hover:text-[#F4B860]">{t('nightShiftSurvival')}</Link></li>
              <li><Link href="/guides/trophy-guide" className="text-base hover:text-[#F4B860]">{t('monstersCreatures')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase">{t('gameResources')}</h3>
            <ul className="mt-4 space-y-4">
              <li><Link href="/builds/best-build" className="text-base hover:text-[#F4B860]">{t('essentialTips')}</Link></li>
              <li><Link href="/builds/weapons" className="text-base hover:text-[#F4B860]">{t('hiddenSecrets')}</Link></li>
              <li><Link href="/builds/armor-sets" className="text-base hover:text-[#F4B860]">{t('systemRequirements')}</Link></li>
              <li><Link href="/world/boss" className="text-base hover:text-[#F4B860]">{t('performanceGuide')}</Link></li>
              <li><Link href="/world/map" className="text-base hover:text-[#F4B860]">{t('gameOverview')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase">{t('communitySupport')}</h3>
            <ul className="mt-4 space-y-4">
              <li><Link href="/community/discord" className="text-base hover:text-[#F4B860]">{t('steamCommunity')}</Link></li>
              <li><Link href="/community/reddit" className="text-base hover:text-[#F4B860]">{t('discordServer')}</Link></li>
              <li><Link href="/community/gameplay" className="text-base hover:text-[#F4B860]">{t('redditCommunities')}</Link></li>
              <li><Link href="/community/wiki" className="text-base hover:text-[#F4B860]">{t('updatesNews')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase">{t('legal')}</h3>
            <ul className="mt-4 space-y-4">
              <li><Link href="/privacy" className="text-base hover:text-[#F4B860]">{t('privacyPolicy')}</Link></li>
              <li><Link href="/terms" className="text-base hover:text-[#F4B860]">{t('termsOfService')}</Link></li>
              <li><Link href="/privacy" className="text-base hover:text-[#F4B860]">{t('cookiePolicy')}</Link></li>
              <li><Link href="/privacy" className="text-base hover:text-[#F4B860]">{t('contact')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 w-full">
          <p className="text-xs text-center text-gray-400 mb-3">
            {t('disclaimer')}
          </p>
          <p className="text-base text-center">
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
