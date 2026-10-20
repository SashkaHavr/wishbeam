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
import { PageLayout } from "~/components/page-layout";
import { ItemFooter } from "~/components/ui/item";
import { cn } from "~/lib/utils";
import { parseWishlistParams, stringifyWishlistParams } from "~/lib/wishlist-params";
import {
  isOwnedQueryOptions,
  sharedWishlistItemsQueryOptions,
  sharedWishlistQueryOptions,
  useLockWishlistItem,
  useUnlockWishlistItem,
} from "~/queries/wishlists";

export const Route = createFileRoute("/app/shared/$id")({
  params: { parse: parseWishlistParams, stringify: stringifyWishlistParams },
  beforeLoad: async ({ context, params }) => {
    const isOwnedWishlist = await context.queryClient.query({
      ...isOwnedQueryOptions(params.id),
      staleTime: "static",
    });
    if (isOwnedWishlist) {
      throw redirect({ to: "/app/wishlists/$id", params: { id: params.id } });
    }
  },
  loader: async ({ context, params }) => {
    try {
      await Promise.all([
        context.queryClient.query({
          ...sharedWishlistQueryOptions(params.id),
          staleTime: "static",
        }),
        context.queryClient.query({
          ...sharedWishlistItemsQueryOptions(params.id),
          staleTime: "static",
        }),
      ]);
    } catch (err) {
      const error = err as ApiErrors["wishlists"]["getSharedById"];
      if (error._tag === "WishlistNotFound") throw notFound();
      throw error;
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const wishlistId = Route.useParams({ select: (state) => state.id });
  const { data: wishlist } = useSuspenseQuery(sharedWishlistQueryOptions(wishlistId));

  const { data: wishlistItems } = useSuspenseQuery(sharedWishlistItemsQueryOptions(wishlistId));

  const lockItem = useLockWishlistItem(wishlistId);
  const unlockItem = useUnlockWishlistItem(wishlistId);

  return (
    <PageLayout>
      <WishlistItemExpanded wishlist={wishlist}>
        {wishlistItems.length === 0 && <WishlistItemsEmptyPublic />}
        {wishlistItems.length > 0 && (
          <WishlistItemsList>
            {wishlistItems.map((wishlistItem) => (
              <WishlistItem
                key={wishlistItem.id}
                wishlistItem={wishlistItem}
                className={cn(
                  "transition-shadow",
                  wishlistItem.lockStatus === "lockedByAnotherUser" && "bg-muted opacity-75",
                  wishlistItem.lockStatus === "lockedByCurrentUser" &&
                    "ring-2 ring-success/30 shadow-[0_0_12px] shadow-success/12",
                )}
              >
                <ItemFooter className="flex">
                  <LockButton
                    className="grow"
                    lockStatus={wishlistItem.lockStatus}
                    lockAction={() => lockItem.mutate(wishlistItem.id)}
                    unlockAction={() => unlockItem.mutate(wishlistItem.id)}
                  />
                </ItemFooter>
              </WishlistItem>
            ))}
          </WishlistItemsList>
        )}
      </WishlistItemExpanded>
    </PageLayout>
  );
}
