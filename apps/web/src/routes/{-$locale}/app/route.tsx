import { isServer } from '@tanstack/react-query';
import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
} from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getCookie as getCookieServer } from '@tanstack/react-start/server';
import { getCookie, setCookie } from 'utils/cookie';

import { AppNav } from '~/components/app-nav';
import { useCacheInvalidation } from '~/hooks/use-cache-invalidation';

const desktopSidebarOpenCookieName = 'desktopSidebarOpen';

const getDesktopSidebarOpenServerFn = createServerFn().handler(() => {
  return getCookieServer(desktopSidebarOpenCookieName);
});

export const Route = createFileRoute('/{-$locale}/app')({
  beforeLoad: async ({ context }) => {
    if (!context.auth.user) {
      throw redirect({ to: '/{-$locale}' });
    }
    return {
      desktopSidebarOpen: JSON.parse(
        (isServer
          ? await getDesktopSidebarOpenServerFn()
          : getCookie(desktopSidebarOpenCookieName)) ?? 'true',
      ) as boolean,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const desktopSidebarOpen = Route.useRouteContext({
    select: (state) => state.desktopSidebarOpen,
  });
  const router = useRouter();

  useCacheInvalidation();

  return (
    <AppNav
      desktopSidebarOpen={desktopSidebarOpen}
      onDesktopSidebarOpenChange={(open) => {
        setCookie(desktopSidebarOpenCookieName, JSON.stringify(open));
        void router.invalidate();
      }}
    >
      <Outlet />
    </AppNav>
  );
}
