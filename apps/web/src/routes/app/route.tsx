import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
} from '@tanstack/react-router';
import { createIsomorphicFn } from '@tanstack/react-start';
import { getCookie } from '@tanstack/react-start/server';

import { AppNav } from '~/components/app-nav';
import { useCacheInvalidation } from '~/hooks/use-cache-invalidation';
import { getClientCookie, setClientCookie } from '~/utils/cookie';

const desktopSidebarOpenCookieName = 'desktopSidebarOpen';

const getDesktopSidebarOpen = createIsomorphicFn()
  .server(() => {
    return getCookie(desktopSidebarOpenCookieName);
  })
  .client(() => {
    return getClientCookie(desktopSidebarOpenCookieName);
  });

export const Route = createFileRoute('/app')({
  beforeLoad: ({ context }) => {
    if (!context.auth.user) {
      throw redirect({ to: '/' });
    }
    return {
      desktopSidebarOpen: JSON.parse(
        getDesktopSidebarOpen() ?? 'true',
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
        setClientCookie(desktopSidebarOpenCookieName, JSON.stringify(open));
        void router.invalidate();
      }}
    >
      <Outlet />
    </AppNav>
  );
}
