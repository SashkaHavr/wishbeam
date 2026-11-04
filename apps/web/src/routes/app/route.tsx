import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { IdBranded } from "@wishbeam/db/id-branded";
import { AppNav } from "~/components/app-nav";
import { useCacheInvalidation } from "~/hooks/use-cache-invalidation";

export const Route = createFileRoute("/app")({
  beforeLoad: ({ context, params, matches }) => {
    const paramsError = matches.find((match) => match.paramsError)?.paramsError;
    if (paramsError) throw paramsError;

    if (!context.session.loggedIn) {
      if ("id" in params && typeof params.id === "string") {
        throw redirect({
          to: "/shared/$id",
          params: { id: IdBranded("wishlist").make(params.id) },
        });
      }
      throw redirect({ to: "/login" });
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
