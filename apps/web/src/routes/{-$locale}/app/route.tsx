import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getCookie as getCookieServer } from '@tanstack/react-start/server';
import { getCookie } from 'utils/cookie';

import { desktopSidebarOpenCookieName, Sidebar } from '~/components/sidebar';

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
        (typeof window === 'undefined'
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
    <div className="flex h-screen">
      <Sidebar
        className="h-full"
        desktopCanBeClosed
        desktopOpenDefault={desktopSidebarOpen}
      />
      <div className="grow overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
