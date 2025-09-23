import { useIsClient } from './use-is-client';
import { useMediaQuery } from './useMediaQuery';

const screens = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};

export function useMatchesBreakpoint(breakpoint: keyof typeof screens) {
  const isClient = useIsClient();
  const matches = useMediaQuery(`(min-width: ${screens[breakpoint]})`, {
    defaultValue: true,
  });
  return !isClient || matches;
}

export function useNotMatchesBreakpoint(breakpoint: keyof typeof screens) {
  const isClient = useIsClient();
  const matches = useMediaQuery(`(min-width: ${screens[breakpoint]})`, {
    defaultValue: true,
  });
  return !isClient || !matches;
}

export function useMobileDesktop() {
  const mobile = useNotMatchesBreakpoint('md');
  const desktop = useMatchesBreakpoint('md');
  // Both are true during SSR
  return { mobile, desktop };
}
