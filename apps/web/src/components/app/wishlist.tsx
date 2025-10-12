import { Link } from '@tanstack/react-router';
import { ChevronRightIcon } from 'lucide-react';

import type { TRPCOutput } from '@wishbeam/trpc';

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '../ui/item';

interface Props {
  wishlist: TRPCOutput['wishlists']['owned']['getAll']['wishlists'][number];
}

export function Wishlist({ wishlist }: Props) {
  return (
    <Item variant="outline" asChild>
      <Link to="/app/wishlists/$id" params={{ id: wishlist.id }}>
        <ItemContent>
          <ItemTitle>{wishlist.title}</ItemTitle>
          <ItemDescription>{wishlist.description}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRightIcon className="size-4" />
        </ItemActions>
      </Link>
    </Item>
  );
}
