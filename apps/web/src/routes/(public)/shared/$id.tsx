import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

import type { ApiErrors } from "@wishbeam/api-contract";
import { LockButton } from "~/components/app/lock-button";
import {
  WishlistItem,
  WishlistItemExpanded,
  WishlistItemsEmptyPublic,
  WishlistItemsList,
} from "~/components/app/wishlist-items";
import { LoginDialog } from "~/components/login";
import { Logo } from "~/components/logo";
import { PageLayout } from "~/components/page-layout";
import { DialogTrigger } from "~/components/ui/dialog";
import { ItemFooter } from "~/components/ui/item";
import { useCacheInvalidation } from "~/hooks/use-cache-invalidation";
import { parseWishlistParams, stringifyWishlistParams } from "~/lib/wishlist-params";
import { publicWishlistItemsQueryOptions, publicWishlistQueryOptions } from "~/queries/wishlists";

export const Route = createFileRoute("/(public)/shared/$id")({
  params: { parse: parseWishlistParams, stringify: stringifyWishlistParams },
  beforeLoad: ({ context, params }) => {
    if (context.session.loggedIn) {
      throw redirect({ to: "/app/shared/$id", params: { id: params.id } });
    }
  },
  loader: async ({ context: { queryClient }, params }) => {
    try {
      const [wishlist] = await Promise.all([
        queryClient.query({ ...publicWishlistQueryOptions(params.id), staleTime: "static" }),
        queryClient.query({ ...publicWishlistItemsQueryOptions(params.id), staleTime: "static" }),
      ]);
      return { title: wishlist.title, description: wishlist.description };
    } catch (err) {
      const error = err as ApiErrors["publicWishlists"]["get"];
      if (error._tag === "WishlistNotFound") throw notFound();
      throw error;
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: loaderData.title }, { name: "description", content: loaderData.description }]
      : [],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const wishlistId = Route.useParams({ select: (state) => state.id });
  const { data: wishlist } = useSuspenseQuery(publicWishlistQueryOptions(wishlistId));
  const { data: wishlistItems } = useSuspenseQuery(publicWishlistItemsQueryOptions(wishlistId));
  useCacheInvalidation(wishlistId);
  return (
    <div className="flex h-[100svh] flex-col">
      <div className="flex h-14 w-full shrink-0 items-center border-b border-border bg-card/80 px-4 backdrop-blur dark:bg-background/80">
        <Logo withName size="md" />
      </div>
      <main className="grow overflow-y-auto">
        <PageLayout>
          <WishlistItemExpanded wishlist={wishlist}>
            {wishlistItems.length === 0 && <WishlistItemsEmptyPublic />}
            {wishlistItems.length > 0 && (
              <WishlistItemsList>
                {wishlistItems.map((wishlistItem) => (
                  <WishlistItem key={wishlistItem.id} wishlistItem={wishlistItem}>
                    <ItemFooter className="flex">
                      <LoginDialog>
                        <DialogTrigger
                          className="grow"
                          render={<LockButton lockStatus={wishlistItem.lockStatus} />}
                        />
                      </LoginDialog>
                    </ItemFooter>
                  </WishlistItem>
                ))}
              </WishlistItemsList>
            )}
          </WishlistItemExpanded>
        </PageLayout>
      </main>
    </div>
  );
}
