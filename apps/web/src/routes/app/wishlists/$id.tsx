import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { EditIcon, Share2Icon, UserPlusIcon } from 'lucide-react';

import type { TRPCOutput } from '@wishbeam/trpc';
import { ItemActions, ItemFooter } from '~/components/ui/item';
import { Separator } from '~/components/ui/separator';

import { DeleteAlertDialog } from '~/components/alerts/delete-alert-dialog';
import { AppDialogTrigger } from '~/components/app-dialog';
import { ShareWishlistDialog } from '~/components/app/share-wishlist-dialog';
import { UpdateOwnersDialog } from '~/components/app/update-owners-dialog';
import { UpdateWishlistDialog } from '~/components/app/update-wishlist-dialog';
import {
  ArchiveWishlistItemButton,
  CreateWishlistItemButton,
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
import {
  wishlistOwnedGetByIdServerFn,
  wishlistOwnedGetItemsServerFn,
} from '~/utils/trpc-server-fns';

export const Route = createFileRoute('/app/wishlists/$id')({
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: context.trpc.wishlists.owned.getById.queryKey({
          wishlistId: params.id,
        }),
        queryFn: () =>
          wishlistOwnedGetByIdServerFn({ data: { wishlistId: params.id } }),
      }),
      context.queryClient.ensureQueryData({
        queryKey: context.trpc.wishlists.owned.items.getAll.queryKey({
          wishlistId: params.id,
        }),
        queryFn: () =>
          wishlistOwnedGetItemsServerFn({ data: { wishlistId: params.id } }),
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

  const activeWishlistItems = wishlistItems.filter(
    (item) => item.status === 'active',
  );
  const archivedWishlistItems = wishlistItems.filter(
    (item) => item.status === 'archived',
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
                <DeleteAlertDialog
                  onClick={() => {
                    deleteWishlist.mutate({ wishlistId });
                    void navigate({ to: '/app/wishlists' });
                  }}
                />
              )}
            </ItemFooter>
          </>
        }
      >
        {wishlistItems.length === 0 && (
          <WishlistItemsEmpty wishlistId={wishlistId} />
        )}
        {wishlistItems.length > 0 && (
          <div className="flex flex-col gap-8">
            <WishlistItemsList>
              {activeWishlistItems.map((wishlistItem) => (
                <WishlistItemComposed
                  key={wishlistItem.id}
                  wishlistId={wishlistId}
                  wishlistItem={wishlistItem}
                />
              ))}
              <CreateWishlistItemButton wishlistId={wishlistId} />
            </WishlistItemsList>
            {archivedWishlistItems.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-medium">Archived</h3>
                  <WishlistItemsList>
                    {archivedWishlistItems.map((wishlistItem) => (
                      <WishlistItemComposed
                        key={wishlistItem.id}
                        wishlistId={wishlistId}
                        wishlistItem={wishlistItem}
                      />
                    ))}
                  </WishlistItemsList>
                </div>
              </>
            )}
          </div>
        )}
      </WishlistItemExpanded>
    </PageLayout>
  );
}

function WishlistItemComposed({
  wishlistId,
  wishlistItem,
}: {
  wishlistItem: TRPCOutput['wishlists']['owned']['items']['getAll']['wishlistItems'][number];
  wishlistId: string;
}) {
  return (
    <WishlistItem wishlistItem={wishlistItem}>
      <ItemFooter className="grid grid-cols-2">
        <UpdateWishlistItemButton
          wishlistItem={wishlistItem}
          wishlistId={wishlistId}
        />
        <DeleteWishlistItemButton
          wishlistItemId={wishlistItem.id}
          wishlistId={wishlistId}
        />
        <ArchiveWishlistItemButton
          wishlistItem={wishlistItem}
          wishlistId={wishlistId}
        />
      </ItemFooter>
    </WishlistItem>
  );
}
