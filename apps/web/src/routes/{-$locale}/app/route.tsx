import { isServer } from '@tanstack/react-query';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getCookie as getCookieServer } from '@tanstack/react-start/server';
import { getCookie } from 'utils/cookie';

import { AppNav } from '~/components/app-nav';
import { desktopSidebarOpenCookieName } from '~/components/sidebar';

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

  return (
    <AppNav desktopSidebarOpenDefault={desktopSidebarOpen}>
      <Outlet />
    </AppNav>
  );
}
