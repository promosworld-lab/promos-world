import { fr } from './fr';
import { en } from './en';

export const translations = {
  fr,
  en,
};

export type Translation = typeof fr;

export function getTranslations(language: 'fr' | 'en') {
  return translations[language];
}