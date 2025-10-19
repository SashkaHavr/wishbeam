import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { EditIcon, Share2Icon, TrashIcon, UserPlusIcon } from 'lucide-react';
import z from 'zod';

import { Button } from '~/components/ui/button';
import { ItemActions, ItemFooter } from '~/components/ui/item';

import { AppDialogTrigger } from '~/components/app-dialog';
import { ShareWishlistDialog } from '~/components/app/share-wishlist-dialog';
import { UpdateOwnersDialog } from '~/components/app/update-owners-dialog';
import { UpdateWishlistDialog } from '~/components/app/update-wishlist-dialog';
import {
  DeleteWishlistItemButton,
  UpdateWishlistItemButton,
  WishlistItem,
  WishlistItemExpanded,
  WishlistItemsEmpty,
  WishlistItemsList,
} from '~/components/app/wishlist-items';
import { PageLayout } from '~/components/page-layout';
import { useDeleteWishlistMutation } from '~/hooks/mutations/wishlists.owned';
import { useTRPC } from '~/lib/trpc';
import { trpcServerFnMiddleware } from '~/lib/trpc-server';

const wishlistGetByIdServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .validator(z.object({ wishlistId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      return await context.trpc.wishlists.owned.getById(data);
    } catch {
      throw notFound();
    }
  });

const wishlistGetItemsServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .validator(z.object({ wishlistId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      return await context.trpc.wishlists.owned.items.getAll(data);
    } catch {
      throw notFound();
    }
  });

export const Route = createFileRoute('/app/wishlists/$id')({
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: context.trpc.wishlists.owned.getById.queryKey({
          wishlistId: params.id,
        }),
        queryFn: () =>
          wishlistGetByIdServerFn({ data: { wishlistId: params.id } }),
      }),
      context.queryClient.ensureQueryData({
        queryKey: context.trpc.wishlists.owned.items.getAll.queryKey({
          wishlistId: params.id,
        }),
        queryFn: () =>
          wishlistGetItemsServerFn({ data: { wishlistId: params.id } }),
      }),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const navigate = useNavigate();

  const wishlistId = Route.useParams({ select: (state) => state.id });
  const { data: wishlist } = useSuspenseQuery(
    trpc.wishlists.owned.getById.queryOptions(
      { wishlistId },
      { select: (data) => data.wishlist },
    ),
  );
  const deleteWishlist = useDeleteWishlistMutation();

  const { data: wishlistItems } = useSuspenseQuery(
    trpc.wishlists.owned.items.getAll.queryOptions(
      { wishlistId },
      { select: (data) => data.wishlistItems },
    ),
  );

  return (
    <PageLayout>
      <WishlistItemExpanded
        wishlist={wishlist}
        itemChildren={
          <>
            <ItemActions>
              <ShareWishlistDialog wishlist={wishlist}>
                <AppDialogTrigger>
                  <Share2Icon />
                  Share
                </AppDialogTrigger>
              </ShareWishlistDialog>
            </ItemActions>
            <ItemFooter className="grid grid-cols-2 pt-2">
              <UpdateWishlistDialog wishlist={wishlist}>
                <AppDialogTrigger variant="outline">
                  <EditIcon />
                  <span>Edit</span>
                </AppDialogTrigger>
              </UpdateWishlistDialog>
              {wishlist.currentUserIsCreator && (
                <UpdateOwnersDialog wishlistId={wishlist.id}>
                  <AppDialogTrigger variant="outline">
                    <UserPlusIcon />
                    <span>Add Owner</span>
                  </AppDialogTrigger>
                </UpdateOwnersDialog>
              )}
              {wishlist.currentUserIsCreator && (
                <Button
                  variant="outline"
                  onClick={() => {
                    deleteWishlist.mutate({ wishlistId });
                    void navigate({ to: '/app/wishlists' });
                  }}
                >
                  <TrashIcon />
                  <span>Delete</span>
                </Button>
              )}
            </ItemFooter>
          </>
        }
      >
        {wishlistItems.length === 0 && (
          <WishlistItemsEmpty wishlistId={wishlistId} />
        )}
        {wishlistItems.length > 0 && (
          <WishlistItemsList>
            {wishlistItems.map((wishlistItem) => (
              <WishlistItem key={wishlistItem.id} wishlistItem={wishlistItem}>
                <ItemFooter className="grid grid-cols-2">
                  <UpdateWishlistItemButton
                    wishlistItem={wishlistItem}
                    wishlistId={wishlistId}
                  />
                  <DeleteWishlistItemButton
                    wishlistItemId={wishlistItem.id}
                    wishlistId={wishlistId}
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
