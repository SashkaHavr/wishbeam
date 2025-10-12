import {
  ChevronDown,
  EditIcon,
  ExternalLinkIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react';

import type { TRPCOutput } from '@wishbeam/trpc';

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
        <WishlistItem key={item.id} wishlistItem={item} />
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
}: {
  wishlistItem: WishlistItemType;
}) {
  return (
    <Collapsible asChild>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>{wishlistItem.title}</ItemTitle>
          <ItemDescription>{wishlistItem.description}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <CollapsibleTrigger asChild>
            <Button variant="ghost">
              <ChevronDown />
              <span>Show more</span>
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
        </CollapsibleContent>
        <ItemFooter>
          <Button variant="outline">
            <EditIcon />
            <span>Edit</span>
          </Button>
          <Button variant="outline">
            <TrashIcon />
            <span>Delete</span>
          </Button>
        </ItemFooter>
      </Item>
    </Collapsible>
  );
}
