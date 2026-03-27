import { I18n } from 'i18n-js';

import en from './translations/en.json';
import th from './translations/th.json';

export type AppLanguage = 'en' | 'th';

const i18n = new I18n({ en, th });
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

function safeGetLanguageCode(): string | null {
  try {
    const localization = require('expo-localization') as {
      getLocales?: () => Array<{ languageCode?: string | null }>;
    };
    const languageCode = localization.getLocales?.()[0]?.languageCode;
    return languageCode ?? null;
  } catch {
    return null;
  }
}

export function detectDeviceLanguage(): AppLanguage {
  const locale = safeGetLanguageCode() ?? 'en';
  return locale.toLowerCase() === 'th' ? 'th' : 'en';
}

export function setI18nLanguage(language: AppLanguage) {
  i18n.locale = language;
}

setI18nLanguage(detectDeviceLanguage());

export function t(key: string, options?: Record<string, unknown>) {
  return i18n.t(key, options);
}
