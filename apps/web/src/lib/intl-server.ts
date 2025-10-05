import type { Locale } from 'use-intl';
import { createIsomorphicFn, createServerFn } from '@tanstack/react-start';
import { getCookie, getRequestHeaders } from '@tanstack/react-start/server';

import { defaultLocale, isLocale, localeCookieName } from '@wishbeam/intl';

import type baseMessages from '../../messages/en.json';
import { getClientCookie } from '~/utils/cookie';

export const getAcceptLanguageHeaderServerFn = createServerFn().handler(() => {
  const headers = getRequestHeaders();
  return (
    headers['accept-language']?.split(',').map((lang) => lang.split(';')[0]) ??
    []
  );
});

export const getLocale = createIsomorphicFn()
  .server(() => {
    const localeFromCookie = getCookie(localeCookieName);
    if (isLocale(localeFromCookie)) {
      return localeFromCookie;
    }

    const headers = getRequestHeaders();
    const locales =
      headers['accept-language']
        ?.split(',')
        .map((lang) => lang.split(';')[0]) ?? [];
    return locales.find(isLocale) ?? defaultLocale;
  })
  .client(() => {
    const localeFromCookie = getClientCookie(localeCookieName);
    if (isLocale(localeFromCookie)) {
      return localeFromCookie;
    }

    const locales = navigator.languages;
    return locales.find(isLocale) ?? defaultLocale;
  });

type BaseMessages = typeof baseMessages;

export async function getMessages(locale: Locale) {
  switch (locale) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case 'en':
      return (await import(
        `../../messages/en.json`
      )) as unknown as BaseMessages;
  }
}

declare module 'use-intl' {
  interface AppConfig {
    Messages: BaseMessages;
  }
}
