import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Supported locales - US English first, then other major languages
export const locales = [
  'en-US', // US English (Primary)
  'en-GB', // British English
  'es',    // Spanish
  'fr',    // French
  'de',    // German
  'it',    // Italian
  'pt',    // Portuguese
  'ru',    // Russian
  'zh',    // Chinese
  'ja',    // Japanese
  'ko',    // Korean
  'ar',    // Arabic
  'hi',    // Hindi
  'bn',    // Bengali
  'ur',    // Urdu
  'tr',    // Turkish
  'nl',    // Dutch
  'sv',    // Swedish
  'no',    // Norwegian
  'da',    // Danish
  'fi',    // Finnish
  'pl',    // Polish
  'cs',    // Czech
  'sk',    // Slovak
  'hu',    // Hungarian
  'ro',    // Romanian
  'bg',    // Bulgarian
  'hr',    // Croatian
  'sl',    // Slovenian
  'et',    // Estonian
  'lv',    // Latvian
  'lt',    // Lithuanian
  'el',    // Greek
  'he',    // Hebrew
  'th',    // Thai
  'vi',    // Vietnamese
  'id',    // Indonesian
  'ms',    // Malay
  'fa',    // Persian
  'uk',    // Ukrainian
  'be',    // Belarusian
  'ka',    // Georgian
  'am',    // Amharic
  'sw',    // Swahili
  'yo',    // Yoruba
  'ig',    // Igbo
  'zu',    // Zulu
  'af',    // Afrikaans
  'is',    // Icelandic
  'mt',    // Maltese
  'cy',    // Welsh
  'ga',    // Irish
  'gd',    // Scottish Gaelic
  'eu',    // Basque
  'ca',    // Catalan
  'gl',    // Galician
  'ast',   // Asturian
  'oc',    // Occitan
  'br',    // Breton
  'co',    // Corsican
  'fur',   // Friulian
  'lad',   // Ladino
  'rm',    // Romansh
  'vec',   // Venetian
  'lmo',   // Lombard
  'pms',   // Piedmontese
  'sc',    // Sardinian
  'scn',   // Sicilian
  'nap',   // Neapolitan
] as const;

export type Locale = (typeof locales)[number];

// Default locale (US English)
export const defaultLocale: Locale = 'en-US';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    locale: locale as string,
    messages: (await import(`./messages/${locale}.json`)).default
  };
}); 