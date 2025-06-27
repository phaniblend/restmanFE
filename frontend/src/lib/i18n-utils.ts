import { useTranslations } from 'next-intl';

// Currency formatting with US pricing as primary
export const formatCurrency = (amount: number, locale: string = 'en-US', currency: string = 'USD'): string => {
  // Always use US formatting for currency display
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
};

// Number formatting based on locale
export const formatNumber = (number: number, locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale).format(number);
};

// Date formatting based on locale
export const formatDate = (date: Date | string, locale: string = 'en-US'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
};

// Time formatting based on locale
export const formatTime = (date: Date | string, locale: string = 'en-US'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

// Phone number formatting based on locale
export const formatPhoneNumber = (phone: string, locale: string = 'en-US'): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // US phone number formatting
  if (locale === 'en-US' && cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Default formatting
  return phone;
};

// Language display names
export const getLanguageName = (locale: string): string => {
  const languageNames: { [key: string]: string } = {
    'en-US': 'English (US)',
    'en-GB': 'English (UK)',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'it': 'Italiano',
    'pt': 'Português',
    'ru': 'Русский',
    'zh': '中文',
    'ja': '日本語',
    'ko': '한국어',
    'ar': 'العربية',
    'hi': 'हिन्दी',
    'bn': 'বাংলা',
    'ur': 'اردو',
    'tr': 'Türkçe',
    'nl': 'Nederlands',
    'sv': 'Svenska',
    'no': 'Norsk',
    'da': 'Dansk',
    'fi': 'Suomi',
    'pl': 'Polski',
    'cs': 'Čeština',
    'sk': 'Slovenčina',
    'hu': 'Magyar',
    'ro': 'Română',
    'bg': 'Български',
    'hr': 'Hrvatski',
    'sl': 'Slovenščina',
    'et': 'Eesti',
    'lv': 'Latviešu',
    'lt': 'Lietuvių',
    'el': 'Ελληνικά',
    'he': 'עברית',
    'th': 'ไทย',
    'vi': 'Tiếng Việt',
    'id': 'Bahasa Indonesia',
    'ms': 'Bahasa Melayu',
    'fa': 'فارسی',
    'uk': 'Українська',
    'be': 'Беларуская',
    'ka': 'ქართული',
    'am': 'አማርኛ',
    'sw': 'Kiswahili',
    'yo': 'Yorùbá',
    'ig': 'Igbo',
    'zu': 'isiZulu',
    'af': 'Afrikaans',
    'is': 'Íslenska',
    'mt': 'Malti',
    'cy': 'Cymraeg',
    'ga': 'Gaeilge',
    'gd': 'Gàidhlig',
    'eu': 'Euskara',
    'ca': 'Català',
    'gl': 'Galego',
    'ast': 'Asturianu',
    'oc': 'Occitan',
    'br': 'Brezhoneg',
    'co': 'Corsu',
    'fur': 'Furlan',
    'lad': 'Ladino',
    'rm': 'Rumantsch',
    'vec': 'Vèneto',
    'lmo': 'Lombard',
    'pms': 'Piemontèis',
    'sc': 'Sardu',
    'scn': 'Sicilianu',
    'nap': 'Nnapulitano'
  };
  
  return languageNames[locale] || locale;
};

// Currency display names
export const getCurrencyName = (currency: string): string => {
  const currencyNames: { [key: string]: string } = {
    'USD': 'US Dollar',
    'EUR': 'Euro',
    'GBP': 'British Pound',
    'JPY': 'Japanese Yen',
    'CNY': 'Chinese Yuan',
    'INR': 'Indian Rupee',
    'CAD': 'Canadian Dollar',
    'AUD': 'Australian Dollar',
    'CHF': 'Swiss Franc',
    'SEK': 'Swedish Krona',
    'NOK': 'Norwegian Krone',
    'DKK': 'Danish Krone',
    'PLN': 'Polish Złoty',
    'CZK': 'Czech Koruna',
    'HUF': 'Hungarian Forint',
    'RON': 'Romanian Leu',
    'BGN': 'Bulgarian Lev',
    'HRK': 'Croatian Kuna',
    'RUB': 'Russian Ruble',
    'TRY': 'Turkish Lira',
    'BRL': 'Brazilian Real',
    'MXN': 'Mexican Peso',
    'ARS': 'Argentine Peso',
    'CLP': 'Chilean Peso',
    'COP': 'Colombian Peso',
    'PEN': 'Peruvian Sol',
    'UYU': 'Uruguayan Peso',
    'VEF': 'Venezuelan Bolívar',
    'KRW': 'South Korean Won',
    'SGD': 'Singapore Dollar',
    'HKD': 'Hong Kong Dollar',
    'TWD': 'New Taiwan Dollar',
    'THB': 'Thai Baht',
    'MYR': 'Malaysian Ringgit',
    'IDR': 'Indonesian Rupiah',
    'PHP': 'Philippine Peso',
    'VND': 'Vietnamese Dong',
    'ZAR': 'South African Rand',
    'EGP': 'Egyptian Pound',
    'NGN': 'Nigerian Naira',
    'KES': 'Kenyan Shilling',
    'GHS': 'Ghanaian Cedi',
    'MAD': 'Moroccan Dirham',
    'TND': 'Tunisian Dinar',
    'DZD': 'Algerian Dinar',
    'LYD': 'Libyan Dinar',
    'SDG': 'Sudanese Pound',
    'ETB': 'Ethiopian Birr',
    'UGX': 'Ugandan Shilling',
    'TZS': 'Tanzanian Shilling',
    'MWK': 'Malawian Kwacha',
    'ZMW': 'Zambian Kwacha',
    'BWP': 'Botswana Pula',
    'NAD': 'Namibian Dollar',
    'MUR': 'Mauritian Rupee',
    'SCR': 'Seychellois Rupee',
    'MVR': 'Maldivian Rufiyaa',
    'LKR': 'Sri Lankan Rupee',
    'BDT': 'Bangladeshi Taka',
    'NPR': 'Nepalese Rupee',
    'PKR': 'Pakistani Rupee',
    'AFN': 'Afghan Afghani',
    'IRR': 'Iranian Rial',
    'IQD': 'Iraqi Dinar',
    'KWD': 'Kuwaiti Dinar',
    'BHD': 'Bahraini Dinar',
    'QAR': 'Qatari Riyal',
    'AED': 'UAE Dirham',
    'OMR': 'Omani Rial',
    'YER': 'Yemeni Rial',
    'SAR': 'Saudi Riyal',
    'JOD': 'Jordanian Dinar',
    'LBP': 'Lebanese Pound',
    'SYP': 'Syrian Pound',
    'ILS': 'Israeli Shekel',
    'PAL': 'Palestinian Pound'
  };
  
  return currencyNames[currency] || currency;
};

// Hook for using translations with currency formatting
export const useI18n = () => {
  const t = useTranslations();
  
  return {
    t,
    formatCurrency: (amount: number, currency: string = 'USD') => formatCurrency(amount, 'en-US', currency),
    formatNumber: (number: number) => formatNumber(number, 'en-US'),
    formatDate: (date: Date | string) => formatDate(date, 'en-US'),
    formatTime: (date: Date | string) => formatTime(date, 'en-US'),
    formatPhoneNumber: (phone: string) => formatPhoneNumber(phone, 'en-US'),
  };
}; 