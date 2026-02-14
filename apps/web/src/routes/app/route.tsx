import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppNav } from "~/components/app-nav";
import { useCacheInvalidation } from "~/hooks/use-cache-invalidation";

export const Route = createFileRoute("/app")({
  beforeLoad: ({ context }) => {
    if (!context.auth.user) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  useCacheInvalidation();

  return (
    <AppNav>
      <Outlet />
    </AppNav>
  );
}
