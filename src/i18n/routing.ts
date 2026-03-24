import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Supported languages (per tools/demand/多语言.md)
  // 1. English (en) - Primary language
  // 2. Russian (ru) - Russian
  // 3. Japanese (ja) - Japanese
  // 4. Spanish (es) - Spanish (Latin America)
  // 5. Portuguese (pt) - Portuguese (Brazil)
  // 6. German (de) - German
  // 7. French (fr) - French
  // 8. Korean (ko) - Korean
  locales: ['en', 'ru', 'ja', 'es', 'pt', 'de', 'fr', 'ko'],

  // Default language
  defaultLocale: 'en',

  // Localized path prefix strategy
  // 'as-needed': Default language (en) has no prefix
  localePrefix: 'as-needed',

  // Enable automatic language detection
  localeDetection: true
});
