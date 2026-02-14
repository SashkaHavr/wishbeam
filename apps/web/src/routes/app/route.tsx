import { createFileRoute, Outlet, redirect, useRouter } from "@tanstack/react-router";

import { AppNav } from "~/components/app-nav";
import { useCacheInvalidation } from "~/hooks/use-cache-invalidation";
import { getCookie, setCookie } from "~/utils/cookie";

const desktopSidebarOpenCookieName = "desktop-sidebar-open";

export const Route = createFileRoute("/app")({
  beforeLoad: async ({ context }) => {
    if (!context.auth.user) {
      throw redirect({ to: "/" });
    }
    return {
      desktopSidebarOpen: JSON.parse(
        (await getCookie(desktopSidebarOpenCookieName)) ?? "true",
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
        void setCookie(desktopSidebarOpenCookieName, JSON.stringify(open));
        void router.invalidate();
      }}
    >
      <Outlet />
    </AppNav>
  );
}
