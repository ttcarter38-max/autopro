import { formatDistanceToNow as fnsFormatDistanceToNow, type Locale } from 'date-fns';
import { enUS, de, es, fr } from 'date-fns/locale';

const LOCALE_MAP: Record<string, Locale> = {
  en: enUS,
  de,
  es,
  fr,
};

function pickLocale(language: string | undefined): Locale {
  if (!language) return enUS;
  const base = language.toLowerCase().split('-')[0];
  return LOCALE_MAP[base] ?? enUS;
}

export function formatDistanceToNowI18n(
  date: Date | number,
  language: string | undefined,
  opts?: { addSuffix?: boolean },
): string {
  return fnsFormatDistanceToNow(date, {
    addSuffix: opts?.addSuffix ?? true,
    locale: pickLocale(language),
  });
}
