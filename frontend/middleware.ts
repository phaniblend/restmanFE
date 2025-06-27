import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,
  
  // Used when no locale matches
  defaultLocale: defaultLocale,
  
  // Always use the default locale for currency formatting
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en-US|en-GB|es|fr|de|it|pt|ru|zh|ja|ko|ar|hi|bn|ur|tr|nl|sv|no|da|fi|pl|cs|sk|hu|ro|bg|hr|sl|et|lv|lt|el|he|th|vi|id|ms|fa|uk|be|ka|am|sw|yo|ig|zu|af|is|mt|cy|ga|gd|eu|ca|gl|ast|oc|br|co|fur|lad|rm|vec|lmo|pms|sc|scn|nap)/:path*']
}; 