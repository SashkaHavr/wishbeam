import type { Locale } from 'use-intl';
import z from 'zod';

export const defaultLocale: (typeof locales)[number] = 'en';
export const locales = ['en'] as const;

export function isLocale(locale: unknown): locale is Locale {
  return (
    typeof locale === 'string' &&
    (locales as readonly string[]).includes(locale)
  );
}

export function parseLocale(localeOptional: string | undefined): Locale {
  if (isLocale(localeOptional)) {
    return localeOptional;
  }
  return defaultLocale;
}

declare module 'use-intl' {
  interface AppConfig {
    Locale: (typeof locales)[number];
  }
}

async function getZodLocale(locale: Locale) {
  switch (locale) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case 'en':
      return (await import(`zod/v4/locales/en.js`)).default;
  }
}

export async function setupZodLocale(locale: Locale) {
  z.config((await getZodLocale(locale))());
}

export const localeHeaderName = 'wishbeam-Locale';
export const localeCookieName = 'wishbeam-locale';
