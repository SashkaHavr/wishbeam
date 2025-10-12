import { useState } from 'react';
import {
  ChevronDown,
  EditIcon,
  ExternalLinkIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react';

import type { TRPCOutput } from '@wishbeam/trpc';

import { cn } from '~/lib/utils';
import { AppDialogTrigger } from '../app-dialog';
import { Button } from '../ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
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

          <Button variant="outline">
            <TrashIcon />
            <span>Delete</span>
          </Button>
        </ItemFooter>
      </Item>
    </Collapsible>
  );
}
