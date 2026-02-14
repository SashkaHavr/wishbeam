import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { LockButton } from "~/components/app/lock-button";
import {
  WishlistItem,
  WishlistItemExpanded,
  WishlistItemsEmptyPublic,
  WishlistItemsList,
} from "~/components/app/wishlist-items";
import { PageLayout } from "~/components/page-layout";
import { ItemFooter } from "~/components/ui/item";
import {
  useLockWishlistItemMutation,
  useUnlockWishlistItemMutation,
} from "~/hooks/mutations/wishlists.shared.items";
import { useTRPC } from "~/lib/trpc";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/app/shared/$id")({
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        context.trpc.wishlists.shared.getById.queryOptions({
          wishlistId: params.id,
        }),
      ),
      context.queryClient.ensureQueryData(
        context.trpc.wishlists.shared.items.getAll.queryOptions({
          wishlistId: params.id,
        }),
      ),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();

  const wishlistId = Route.useParams({ select: (state) => state.id });
  const { data: wishlist } = useSuspenseQuery(
    trpc.wishlists.shared.getById.queryOptions({ wishlistId }, { select: (data) => data.wishlist }),
  );

  const { data: wishlistItems } = useSuspenseQuery(
    trpc.wishlists.shared.items.getAll.queryOptions(
      { wishlistId },
      { select: (data) => data.wishlistItems },
    ),
  );

  const lockItem = useLockWishlistItemMutation(wishlistId);
  const unlockItem = useUnlockWishlistItemMutation(wishlistId);

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
                  wishlistItem.lockStatus === "lockedByAnotherUser" && "bg-muted/50",
                  wishlistItem.lockStatus === "lockedByCurrentUser" && "shadow-lg",
                )}
              >
                <ItemFooter className="flex">
                  <LockButton
                    className="grow"
                    lockStatus={wishlistItem.lockStatus}
                    lockAction={() => lockItem.mutate({ wishlistItemId: wishlistItem.id })}
                    unlockAction={() => unlockItem.mutate({ wishlistItemId: wishlistItem.id })}
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
