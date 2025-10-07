import { useIsClient } from './use-is-client';
import { useMediaQuery } from './use-media-query';

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

export function useMobile() {
  return useNotMatchesBreakpoint('md');
}

export function useDesktop() {
  return useMatchesBreakpoint('md');
}
