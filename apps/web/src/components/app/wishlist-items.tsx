import { useState } from 'react';
import {
  ChevronDown,
  CircleSlash2Icon,
  EditIcon,
  ExternalLinkIcon,
  GiftIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react';

import type { TRPCOutput } from '@wishbeam/trpc';

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
  ItemFooter,
  ItemTitle,
} from '../ui/item';
import { CreateWishlistItemDialog } from './create-wishlist-item-dialog';
import { UpdateWishlistItemDialog } from './update-wishlist-item-dialog';

type WishlistItemType =
  TRPCOutput['wishlists']['owned']['items']['getAll']['wishlistItems'][number];

interface Props {
  wishlistId: string;
  wishlistItems: WishlistItemType[];
}

export function WishlistItems({ wishlistId, wishlistItems }: Props) {
  if (wishlistItems.length === 0) {
    return (
      <Empty className="row-[1]">
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

  return (
    <div className="flex flex-col gap-4">
      {wishlistItems.map((item) => (
        <WishlistItem
          key={item.id}
          wishlistItem={item}
          wishlistId={wishlistId}
        />
      ))}
      <CreateWishlistItemDialog wishlistId={wishlistId}>
        <AppDialogTrigger size="lg" variant="outline">
          <PlusIcon />
          <span>Create new wishlist item</span>
        </AppDialogTrigger>
      </CreateWishlistItemDialog>
    </div>
  );
}

export function WishlistItem({
  wishlistItem,
  wishlistId,
}: {
  wishlistItem: WishlistItemType;
  wishlistId: string;
}) {
  const [open, setOpen] = useState(false);

  const deleteWishlistItem = useDeleteWishlistItemMutation({ wishlistId });

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
        <ItemFooter>
          <UpdateWishlistItemDialog
            wishlistItem={wishlistItem}
            wishlistId={wishlistId}
          >
            <AppDialogTrigger variant="outline">
              <EditIcon />
              <span>Edit</span>
            </AppDialogTrigger>
          </UpdateWishlistItemDialog>
          <Button
            variant="outline"
            onClick={() =>
              deleteWishlistItem.mutate({ wishlistItemId: wishlistItem.id })
            }
          >
            <TrashIcon />
            <span>Delete</span>
          </Button>
        </ItemFooter>
      </Item>
    </Collapsible>
  );
}
