import React, { useState } from 'react';
import {
  ChevronDown,
  CircleSlash2Icon,
  EditIcon,
  ExternalLinkIcon,
  GiftIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react';

import { useDeleteWishlistItemMutation } from '~/hooks/mutations/wishlists.owned.items';
import { cn } from '~/lib/utils';
import { AppDialogTrigger } from '../app-dialog';
import { Button } from '../ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
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
  return <div className={cn('flex flex-col gap-4', className)} {...props} />;
}

export function WishlistItem({
  wishlistItem,
  children,
}: {
  wishlistItem: WishlistItem;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible asChild open={open} onOpenChange={setOpen}>
      <Item className="gap-0" variant="outline">
        <ItemContent className="mr-4 mb-4">
          <ItemTitle>{wishlistItem.title}</ItemTitle>
          <ItemDescription>{wishlistItem.description}</ItemDescription>
        </ItemContent>
        <ItemActions className="mb-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost">
              <ChevronDown
                className={cn('transition-transform', open && 'rotate-180')}
              />
              <span>{open ? 'Show less' : 'Show more'}</span>
            </Button>
          </CollapsibleTrigger>
        </ItemActions>
        <CollapsibleContent className="flex basis-full flex-col gap-1">
          {wishlistItem.links.map((link, index) => (
            <Item key={index} size="sm" asChild>
              <a href={link} target="_blank" rel="noopener noreferrer">
                <ItemContent>
                  <ItemTitle>{link}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <ExternalLinkIcon className="size-4" />
                </ItemActions>
              </a>
            </Item>
          ))}
          <div className="h-4 w-full" />
        </CollapsibleContent>
        {children}
      </Item>
    </Collapsible>
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
    <Button
      variant="outline"
      onClick={() => deleteWishlistItem.mutate({ wishlistItemId })}
      {...props}
    >
      <TrashIcon />
      <span>Delete</span>
    </Button>
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
