import { isServer } from '@tanstack/react-query';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getCookie as getCookieServer } from '@tanstack/react-start/server';
import { getCookie } from 'utils/cookie';

import { Separator } from '~/components/ui/separator';

import { MobileNav } from '~/components/mobile-nav';
import { desktopSidebarOpenCookieName, Sidebar } from '~/components/sidebar';
import { useMobileDesktop } from '~/hooks/useBreakpoint';

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
  const { mobile, desktop } = useMobileDesktop();

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {desktop && (
        <>
          <Sidebar desktopCanBeClosed desktopOpenDefault={desktopSidebarOpen} />
          <Separator orientation="vertical" className="hidden md:block" />
        </>
      )}
      {mobile && (
        <>
          <MobileNav />
          <Separator orientation="horizontal" className="md:hidden" />
        </>
      )}
      <div className="grow overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
