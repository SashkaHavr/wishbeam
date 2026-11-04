import type { LinkProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { ChevronRightIcon, PlusIcon } from "lucide-react";
import type React from "react";

import type { IdBranded } from "@wishbeam/db/id-branded";
import { m } from "@wishbeam/intl/messages";
import { CreateWishlistDialog } from "~/routes/app/wishlists/-/wishlist-form";

import { Button } from "../ui/button";
import { DialogTrigger } from "../ui/dialog";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "../ui/item";

const _wishlistPages = ["/app/wishlists/$id", "/app/shared/$id"] satisfies LinkProps["to"][];

export function Wishlist({
  wishlist,
  targetPage,
}: {
  wishlist: {
    id: IdBranded<"wishlist">;
    title: string;
    description: string;
  };
  targetPage: (typeof _wishlistPages)[number];
}) {
  return (
    <Item
      variant="outline"
      render={<Link to={targetPage} resetScroll={false} params={{ id: wishlist.id }} />}
    >
      <ItemContent>
        <ItemTitle>{wishlist.title}</ItemTitle>
        <ItemDescription>{wishlist.description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <ChevronRightIcon className="size-4" />
      </ItemActions>
    </Item>
  );
}

export function WishlistList({ className, ...props }: React.ComponentProps<"div">) {
  return <ItemGroup className={cn("gap-4", className)} {...props} />;
}

export function CreateWishlistButton(props: React.ComponentProps<typeof Button>) {
  return (
    <CreateWishlistDialog>
      <DialogTrigger render={<Button size="lg" variant="outline" {...props} />}>
        <PlusIcon />
        <span>{m.wishlist_createNew()}</span>
      </DialogTrigger>
    </CreateWishlistDialog>
  );
}
