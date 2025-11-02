/// <reference types="vite/client" />

import type { ReactNode } from 'react';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useMatches,
} from '@tanstack/react-router';

import { setupZodLocale } from '@wishbeam/intl';

import type { TRPCRouteContext } from '~/lib/trpc';
import { getTheme } from '~/components/theme/context';
import { ThemeProvider, ThemeScript } from '~/components/theme/provider';
import { getAuthContext } from '~/lib/auth';
import { getAuthConfigServerFn } from '~/lib/auth-server';
import { IntlProvider } from '~/lib/intl';
import { getLocale, getMessages } from '~/lib/intl-server';
import { cn } from '~/lib/utils';
import { seo } from '~/utils/seo';
import indexCss from '../index.css?url';

export const Route = createRootRouteWithContext<TRPCRouteContext>()({
  beforeLoad: async ({ context: { queryClient, trpc } }) => {
    const locale = getLocale();
    await setupZodLocale(locale);
    await queryClient.ensureQueryData({
      queryKey: trpc.config.authConfig.queryKey(),
      queryFn: () => getAuthConfigServerFn(),
    });

    return {
      auth: await getAuthContext(queryClient),
      intl: {
        messages: await getMessages(locale),
        locale: locale,
      },
      theme: getTheme(),
    };
  },
  component: RootComponent,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      { name: 'theme-color' },
      ...seo({ title: 'Wishbeam' }),
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [
      { rel: 'stylesheet', href: indexCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
  }),
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { locale, theme } = Route.useRouteContext({
    select: (s) => ({ locale: s.intl.locale, theme: s.theme }),
  });
  const matches = useMatches();
  const lastRoute = matches[matches.length - 1]?.routeId;
  const overscrollClass =
    lastRoute !== undefined &&
    (lastRoute.startsWith('/app') ||
      lastRoute.startsWith('/(public)/shared')) &&
    'overscroll-y-none';

  return (
    <html
      suppressHydrationWarning
      lang={locale}
      className={cn(theme !== 'system' && theme, overscrollClass)}
    >
      <head>
        <HeadContent />
        <ThemeScript />
      </head>
      <body className={cn(overscrollClass)}>
        <ThemeProvider>
          <IntlProvider>{children}</IntlProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
