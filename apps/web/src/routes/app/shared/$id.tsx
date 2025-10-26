import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import z from 'zod';

import { ItemFooter } from '~/components/ui/item';

import { LockButton } from '~/components/app/lock-button';
import {
  WishlistItem,
  WishlistItemExpanded,
  WishlistItemsEmptyPublic,
  WishlistItemsList,
} from '~/components/app/wishlist-items';
import { PageLayout } from '~/components/page-layout';
import {
  useLockWishlistItemMutation,
  useUnlockWishlistItemMutation,
} from '~/hooks/mutations/wishlists.shared.items';
import { useTRPC } from '~/lib/trpc';
import { trpcServerFnMiddleware } from '~/lib/trpc-server';

const wishlistSharedGetByIdServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .validator(z.object({ wishlistId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      return await context.trpc.wishlists.shared.getById(data);
    } catch {
      throw notFound();
    }
  });

const wishlistSharedGetItemsServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .validator(z.object({ wishlistId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      return await context.trpc.wishlists.shared.items.getAll(data);
    } catch {
      throw notFound();
    }
  });

export const Route = createFileRoute('/app/shared/$id')({
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: context.trpc.wishlists.shared.getById.queryKey({
          wishlistId: params.id,
        }),
        queryFn: () =>
          wishlistSharedGetByIdServerFn({ data: { wishlistId: params.id } }),
      }),
      context.queryClient.ensureQueryData({
        queryKey: context.trpc.wishlists.shared.items.getAll.queryKey({
          wishlistId: params.id,
        }),
        queryFn: () =>
          wishlistSharedGetItemsServerFn({ data: { wishlistId: params.id } }),
      }),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();

  const wishlistId = Route.useParams({ select: (state) => state.id });
  const { data: wishlist } = useSuspenseQuery(
    trpc.wishlists.shared.getById.queryOptions(
      { wishlistId },
      { select: (data) => data.wishlist },
    ),
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
              <WishlistItem key={wishlistItem.id} wishlistItem={wishlistItem}>
                <ItemFooter className="flex">
                  <LockButton
                    className="grow"
                    lockStatus={wishlistItem.lockStatus}
                    lockAction={() =>
                      lockItem.mutate({ wishlistItemId: wishlistItem.id })
                    }
                    unlockAction={() =>
                      unlockItem.mutate({ wishlistItemId: wishlistItem.id })
                    }
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
