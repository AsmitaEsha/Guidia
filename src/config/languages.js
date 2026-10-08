// Single source of truth for UI languages. Mirrors
// backend/src/config/languages.js. Components never hardcode language
// lists or branch on language codes — they read from here.

export const LANGUAGES = [
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    locale: 'en-US',
    htmlLang: 'en',
    currency: 'USD',
    speech: { bcp47: 'en-US', voiceHints: ['en-us', 'en-gb', 'en-in', 'english'] },
  },
  {
    code: 'bn',
    nativeName: 'বাংলা',
    englishName: 'Bengali',
    locale: 'bn-BD',
    htmlLang: 'bn',
    currency: 'BDT',
    speech: { bcp47: 'bn-BD', voiceHints: ['bn-bd', 'bn-in', 'bn', 'bengali', 'bangla'] },
  },
  {
    code: 'hi',
    nativeName: 'हिन्दी',
    englishName: 'Hindi',
    locale: 'hi-IN',
    htmlLang: 'hi',
    currency: 'INR',
    speech: { bcp47: 'hi-IN', voiceHints: ['hi-in', 'hi', 'hindi'] },
  },
  {
    code: 'vi',
    nativeName: 'Tiếng Việt',
    englishName: 'Vietnamese',
    locale: 'vi-VN',
    htmlLang: 'vi',
    currency: 'VND',
    speech: { bcp47: 'vi-VN', voiceHints: ['vi-vn', 'vi', 'vietnamese'] },
  },
];

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);
export const DEFAULT_LANGUAGE = 'en';

export function getLanguage(code) {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}
