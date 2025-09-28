import type { ReactNode } from 'react';
import { HeadContent, Scripts, useRouteContext } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';

import { IntlProvider } from '~/lib/intl';

export function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const locale = useRouteContext({
    from: '/{-$locale}',
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
