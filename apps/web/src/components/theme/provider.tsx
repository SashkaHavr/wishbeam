import { useEffect, useEffectEvent, useState } from 'react';
import { ScriptOnce, useRouteContext, useRouter } from '@tanstack/react-router';
import { createIsomorphicFn } from '@tanstack/react-start';

import type { ResolvedTheme } from './context';
import { setThemeCookie, ThemeContext } from './context';

const MEDIA = '(prefers-color-scheme: dark)';

const getSystemTheme = createIsomorphicFn()
  .server((_e?: MediaQueryListEvent | MediaQueryList) => {
    return 'light' as const;
  })
  .client((e?: MediaQueryListEvent | MediaQueryList) => {
    return (e ?? window.matchMedia(MEDIA)).matches ? 'dark' : 'light';
  });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const savedTheme = useRouteContext({
    from: '__root__',
    select: (s) => s.theme,
  });
  const setSavedTheme = (newTheme: ResolvedTheme) => {
    setThemeCookie(newTheme);
    void router.invalidate();
  };

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light');

  const handleMediaQuery = useEffectEvent(
    (e: MediaQueryListEvent | MediaQueryList) => {
      if (savedTheme !== 'system') return;
      const systemTheme = getSystemTheme(e);
      setSystemTheme(systemTheme);
      document.documentElement.classList.toggle('dark', systemTheme === 'dark');
    },
  );

  useEffect(() => {
    const media = window.matchMedia(MEDIA);
    media.addEventListener('change', handleMediaQuery);
    handleMediaQuery(media);
    return () => media.removeEventListener('change', handleMediaQuery);
  }, []);

  const resolvedTheme = savedTheme === 'system' ? systemTheme : savedTheme;

  return (
    <ThemeContext
      value={{ theme: savedTheme, setTheme: setSavedTheme, resolvedTheme }}
    >
      {children}
    </ThemeContext>
  );
}

export function ThemeScript() {
  return (
    <ScriptOnce>
      {`const isSystemTheme = !document.documentElement.classList.contains('light') && !document.documentElement.classList.contains('dark');
      if (isSystemTheme) document.documentElement.classList.toggle("dark", window.matchMedia("(prefers-color-scheme: dark)").matches);`}
    </ScriptOnce>
  );
}
