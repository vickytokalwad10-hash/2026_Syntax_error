import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all 11 locale JSON files
import en from './locales/en/translation.json';
import hi from './locales/hi/translation.json';
import mr from './locales/mr/translation.json';
import pa from './locales/pa/translation.json';
import gu from './locales/gu/translation.json';
import te from './locales/te/translation.json';
import ta from './locales/ta/translation.json';
import kn from './locales/kn/translation.json';
import bn from './locales/bn/translation.json';
import ml from './locales/ml/translation.json';
import or from './locales/or/translation.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
  pa: { translation: pa },
  gu: { translation: gu },
  te: { translation: te },
  ta: { translation: ta },
  kn: { translation: kn },
  bn: { translation: bn },
  ml: { translation: ml },
  or: { translation: or },
};

// Priority: Saved in localStorage -> default to 'hi' (Hindi) for farmer accessibility or 'en'
const savedLanguage = localStorage.getItem('agripulse_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
