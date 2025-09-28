import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

import en from '../locales/en.json';
import ur from '../locales/ur.json';

const i18n = new I18n({
  en,
  ur,
});

// Set the locale once at the beginning of your app.
i18n.locale = Localization.getLocales()[0].languageCode || 'en';

// When a value is missing from a language it'll fallback to another language with the key present.
i18n.enableFallback = true;

export default i18n;