import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppNav } from "~/components/app-nav";
import { useCacheInvalidation } from "~/hooks/use-cache-invalidation";

export const Route = createFileRoute("/app")({
  beforeLoad: ({ context, params, matches }) => {
    if (!context.auth.user) {
      const wishlistPage = matches.find(
        (match) => match.routeId === "/app/wishlists/$id" || match.routeId === "/app/shared/$id",
      );
      if (wishlistPage && "id" in params && typeof params.id === "string") {
        throw redirect({ to: "/shared/$id", params: { id: params.id } });
      }

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
