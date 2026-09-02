import type { Language } from '@/types';

export const LANGUAGES = {
  fr: {
    code: 'fr',
    label: 'Français',
    flag: '🇫🇷',
  },

  en: {
    code: 'en',
    label: 'English',
    flag: '🇬🇧',
  },
} as const;

export const DEFAULT_LANGUAGE: Language = 'fr';

export const LANGUAGE_STORAGE_KEY = 'promos-world-language';