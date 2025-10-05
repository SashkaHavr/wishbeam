/// <reference types="vite/client" />

import type { ReactNode } from 'react';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';

import { setupZodLocale } from '@wishbeam/intl';

import type { TRPCRouteContext } from '~/lib/trpc';
import { getAuthContext } from '~/lib/auth';
import { IntlProvider } from '~/lib/intl';
import { getLocale, getMessages } from '~/lib/intl-server';
import indexCss from '../index.css?url';

export const Route = createRootRouteWithContext<TRPCRouteContext>()({
  beforeLoad: async ({ context: { queryClient } }) => {
    const locale = getLocale();
    await setupZodLocale(locale);

    return {
      auth: await getAuthContext(queryClient),
      intl: {
        messages: await getMessages(locale),
        locale: locale,
      },
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
      {
        title: 'Wishbeam',
      },
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
  const locale = Route.useRouteContext({
    select: (s) => s.intl.locale,
  });

  return (
    <html suppressHydrationWarning lang={locale}>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider attribute="class">
          <IntlProvider>{children}</IntlProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
