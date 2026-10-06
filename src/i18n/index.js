import { LANGUAGE_CODES, getLanguage } from '../config/languages';

// Translation helpers.
//
//   t('Home', 'হোম', 'होम', 'Trang chủ')   positional, in LANGUAGE_CODES order
//   t({ en: 'Home', bn: 'হোম' })           object form (also used for content
//                                           coming from the API)
//
// Missing translations fall back to English, never to an empty string.

export function makeT(language) {
  const index = Math.max(0, LANGUAGE_CODES.indexOf(language));
  return function t(first, ...rest) {
    if (first && typeof first === 'object') return localize(first, language);
    const variants = [first, ...rest];
    return variants[index] || variants[0] || '';
  };
}

export function localize(value, language) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[language] || value.en || Object.values(value).find(Boolean) || '';
}

export function hasTranslation(value, language) {
  return Boolean(value && typeof value === 'object' && value[language]);
}

// Locale-aware formatting.
export function formatMoney(minor, currency, language) {
  const exp = currency === 'VND' ? 0 : 2;
  return new Intl.NumberFormat(getLanguage(language).locale, { style: 'currency', currency, maximumFractionDigits: exp }).format(minor / 10 ** exp);
}

export function formatDate(iso, language, opts = { dateStyle: 'medium' }) {
  return new Intl.DateTimeFormat(getLanguage(language).locale, opts).format(new Date(iso));
}

export function formatRelative(iso, language) {
  const rtf = new Intl.RelativeTimeFormat(getLanguage(language).locale, { numeric: 'auto' });
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return rtf.format(Math.round(diff), 'second');
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 7 * 86400) return rtf.format(Math.round(diff / 86400), 'day');
  return formatDate(iso, language);
}
