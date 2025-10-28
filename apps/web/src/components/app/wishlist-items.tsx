import React from 'react';
import {
  ArchiveIcon,
  CircleSlash2Icon,
  EditIcon,
  ExternalLinkIcon,
  GiftIcon,
  PlusIcon,
} from 'lucide-react';

import {
  useDeleteWishlistItemMutation,
  useSetStatusWishlistItemMutation,
} from '~/hooks/mutations/wishlists.owned.items';
import { cn } from '~/lib/utils';
import { DeleteAlertDialog } from '../alerts/delete-alert-dialog';
import { AppDialogTrigger } from '../app-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '../ui/item';
import { Separator } from '../ui/separator';
import { CreateWishlistItemDialog } from './create-wishlist-item-dialog';
import { UpdateWishlistItemDialog } from './update-wishlist-item-dialog';

interface WishlistItem {
  id: string;
  title: string;
  description: string;
  links: string[];
  estimatedPrice: string | null;
}

export function WishlistItemsEmpty({ wishlistId }: { wishlistId: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleSlash2Icon />
        </EmptyMedia>
        <EmptyTitle>No Wishlist Items Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any wishlist items yet. Get started by
          creating your first wishlist item.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <CreateWishlistItemDialog wishlistId={wishlistId}>
          <AppDialogTrigger className="mx-4 w-full">
            <GiftIcon />
            <span>Create Wishlist Item</span>
          </AppDialogTrigger>
        </CreateWishlistItemDialog>
      </EmptyContent>
    </Empty>
  );
}

export function WishlistItemsEmptyPublic() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleSlash2Icon />
        </EmptyMedia>
        <EmptyTitle>No Wishlist Items Yet</EmptyTitle>
        <EmptyDescription>
          There aren't any items in this wishlist.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function CreateWishlistItemButton({
  wishlistId,
  ...props
}: { wishlistId: string } & React.ComponentProps<typeof AppDialogTrigger>) {
  return (
    <CreateWishlistItemDialog wishlistId={wishlistId}>
      <AppDialogTrigger size="lg" variant="outline" {...props}>
        <PlusIcon />
        <span>Create new wishlist item</span>
      </AppDialogTrigger>
    </CreateWishlistItemDialog>
  );
}

export function WishlistItemsList({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <ItemGroup className={cn('gap-4', className)} {...props} />;
}

export function WishlistItem({
  children,
  wishlistItem,
  ...props
}: Omit<React.ComponentProps<typeof Item>, 'variant'> & {
  wishlistItem: WishlistItem;
}) {
  return (
    <Item variant="outline" {...props}>
      <ItemContent>
        <ItemTitle className="text-lg">{wishlistItem.title}</ItemTitle>
        <ItemDescription>{wishlistItem.description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        {wishlistItem.estimatedPrice && (
          <span className="font-medium">{`~${wishlistItem.estimatedPrice}`}</span>
        )}
      </ItemActions>
      <ItemGroup className="basis-full gap-1">
        {wishlistItem.links.map((link, index) => (
          <Item key={index} size="sm" asChild>
            <a href={link} target="_blank" rel="noopener noreferrer">
              <ItemContent>
                <ItemTitle>{new URL(link).hostname}</ItemTitle>
              </ItemContent>
              <ItemActions>
                <ExternalLinkIcon className="size-4" />
              </ItemActions>
            </a>
          </Item>
        ))}
      </ItemGroup>
      {children}
    </Item>
  );
}

export function UpdateWishlistItemButton({
  wishlistItem,
  wishlistId,
  ...props
}: {
  wishlistItem: WishlistItem;
  wishlistId: string;
} & React.ComponentProps<typeof AppDialogTrigger>) {
  return (
    <UpdateWishlistItemDialog
      wishlistItem={wishlistItem}
      wishlistId={wishlistId}
    >
      <AppDialogTrigger variant="outline" {...props}>
        <EditIcon />
        <span>Edit</span>
      </AppDialogTrigger>
    </UpdateWishlistItemDialog>
  );
}

export function DeleteWishlistItemButton({
  wishlistItemId,
  wishlistId,
  ...props
}: {
  wishlistItemId: string;
  wishlistId: string;
} & React.ComponentProps<typeof Button>) {
  const deleteWishlistItem = useDeleteWishlistItemMutation({ wishlistId });

  return (
    <DeleteAlertDialog
      onClick={() => deleteWishlistItem.mutate({ wishlistItemId })}
      {...props}
    />
  );
}

export function ArchiveWishlistItemButton({
  wishlistItem,
  wishlistId,
}: {
  wishlistItem: { id: string; status: 'active' | 'archived' };
  wishlistId: string;
}) {
  const archiveWishlistItem = useSetStatusWishlistItemMutation({ wishlistId });
  return (
    <>
      {wishlistItem.status === 'active' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">
              <ArchiveIcon />
              <span>Archive</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive Item</AlertDialogTitle>
              <AlertDialogDescription>
                This will archive the item and remove locks placed on it by
                other users. You can reactivate the item later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  archiveWishlistItem.mutate({
                    wishlistItemId: wishlistItem.id,
                    status: 'archived',
                  })
                }
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {wishlistItem.status === 'archived' && (
        <Button
          variant="outline"
          onClick={() =>
            archiveWishlistItem.mutate({
              wishlistItemId: wishlistItem.id,
              status: 'active',
            })
          }
        >
          <ArchiveIcon />
          <span>Activate</span>
        </Button>
      )}
    </>
  );
}

export function WishlistItemExpanded({
  wishlist,
  itemChildren,
  children,
  className,
  ...props
}: {
  wishlist: { id: string; title: string; description: string };
  itemChildren?: React.ReactNode;
} & React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <Item>
        <ItemContent>
          <ItemTitle>
            <h2 className="text-lg font-medium">{wishlist.title}</h2>
          </ItemTitle>
          <ItemDescription>{wishlist.description}</ItemDescription>
        </ItemContent>
        {itemChildren}
      </Item>
      <div className="my-4 px-2">
        <Separator />
      </div>
      {children}
    </div>
  );
}
