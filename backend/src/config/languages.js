// Single source of truth for languages the backend accepts and how they are
// named to the AI. Mirrors src/config/languages.js on the frontend — add a
// language in both places and nowhere else.

export const LANGUAGES = {
  en: { code: 'en', englishName: 'English', nativeName: 'English', locale: 'en-US', currency: 'USD' },
  bn: { code: 'bn', englishName: 'Bengali', nativeName: 'বাংলা', locale: 'bn-BD', currency: 'BDT' },
  hi: { code: 'hi', englishName: 'Hindi', nativeName: 'हिन्दी', locale: 'hi-IN', currency: 'INR' },
  vi: { code: 'vi', englishName: 'Vietnamese', nativeName: 'Tiếng Việt', locale: 'vi-VN', currency: 'VND' },
};

export const LANGUAGE_CODES = Object.keys(LANGUAGES);
export const DEFAULT_LANGUAGE = 'en';

export function isSupportedLanguage(code) {
  return Object.hasOwn(LANGUAGES, code);
}

export function normalizeLanguage(code) {
  return isSupportedLanguage(code) ? code : DEFAULT_LANGUAGE;
}

export function languageName(code) {
  return LANGUAGES[normalizeLanguage(code)].englishName;
}
