import {
  ArchiveIcon,
  CircleSlash2Icon,
  EditIcon,
  ExternalLinkIcon,
  GiftIcon,
  PlusIcon,
} from "lucide-react";
import React from "react";

import type { IdBranded } from "@wishbeam/db/id-branded";
import { m } from "@wishbeam/intl/messages";
import { cn } from "~/lib/utils";
import { useDeleteWishlistItem, useSetItemStatus } from "~/queries/wishlists";
import {
  CreateWishlistItemDialog,
  UpdateWishlistItemDialog,
} from "~/routes/app/wishlists/-/item-form";

import { DeleteAlertDialog } from "../alerts/delete-alert-dialog";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { DialogTrigger } from "../ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "../ui/item";
import { Separator } from "../ui/separator";

interface WishlistItem {
  id: IdBranded<"wishlist-item">;
  title: string;
  description: string;
  links: readonly string[];
  estimatedPrice: string | null;
}

export function WishlistItemsEmpty({ wishlistId }: { wishlistId: IdBranded<"wishlist"> }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleSlash2Icon />
        </EmptyMedia>
        <EmptyTitle>{m.item_emptyTitle()}</EmptyTitle>
        <EmptyDescription>{m.item_emptyDescription()}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <CreateWishlistItemDialog wishlistId={wishlistId}>
          <DialogTrigger className="mx-4 w-full" render={<Button />}>
            <GiftIcon />
            <span>{m.item_createEmpty()}</span>
          </DialogTrigger>
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
        <EmptyTitle>{m.item_emptyTitle()}</EmptyTitle>
        <EmptyDescription>{m.item_emptyPublicDescription()}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function CreateWishlistItemButton({
  wishlistId,
  ...props
}: { wishlistId: IdBranded<"wishlist"> } & React.ComponentProps<typeof Button>) {
  return (
    <CreateWishlistItemDialog wishlistId={wishlistId}>
      <DialogTrigger render={<Button size="lg" variant="outline" {...props} />}>
        <PlusIcon />
        <span>{m.item_createNew()}</span>
      </DialogTrigger>
    </CreateWishlistItemDialog>
  );
}

export function WishlistItemsList({ className, ...props }: React.ComponentProps<"div">) {
  return <ItemGroup className={cn("gap-4", className)} {...props} />;
}

export function WishlistItem({
  children,
  wishlistItem,
  ...props
}: Omit<React.ComponentProps<typeof Item>, "variant"> & {
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
          <Item
            key={`${wishlistItem.id}-${index}-link`}
            size="sm"
            // oxlint-disable-next-line anchor-has-content
            render={
              <a
                href={link}
                aria-label={new URL(link).hostname}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <ItemContent>
              <ItemTitle>{new URL(link).hostname}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <ExternalLinkIcon className="size-4" />
            </ItemActions>
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
  wishlistId: IdBranded<"wishlist">;
} & React.ComponentProps<typeof Button>) {
  return (
    <UpdateWishlistItemDialog wishlistItem={wishlistItem} wishlistId={wishlistId}>
      <DialogTrigger render={<Button variant="outline" {...props} />}>
        <EditIcon />
        <span>{m.action_edit()}</span>
      </DialogTrigger>
    </UpdateWishlistItemDialog>
  );
}

export function DeleteWishlistItemButton({
  wishlistItemId,
  wishlistId,
  ...props
}: {
  wishlistItemId: IdBranded<"wishlist-item">;
  wishlistId: IdBranded<"wishlist">;
} & React.ComponentProps<typeof Button>) {
  const deleteWishlistItem = useDeleteWishlistItem(wishlistId);

  return <DeleteAlertDialog onClick={() => deleteWishlistItem.mutate(wishlistItemId)} {...props} />;
}

export function ArchiveWishlistItemButton({
  wishlistItem,
  wishlistId,
}: {
  wishlistItem: { id: IdBranded<"wishlist-item">; status: "active" | "archived" };
  wishlistId: IdBranded<"wishlist">;
}) {
  const archiveWishlistItem = useSetItemStatus(wishlistId);
  return (
    <>
      {wishlistItem.status === "active" && (
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="outline" />}>
            <ArchiveIcon />
            <span>{m.item_archive()}</span>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{m.item_archiveTitle()}</AlertDialogTitle>
              <AlertDialogDescription>{m.item_archiveDescription()}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogClose render={<Button variant="ghost" />}>
                {m.action_cancel()}
              </AlertDialogClose>
              <AlertDialogClose
                render={<Button />}
                onClick={() =>
                  archiveWishlistItem.mutate({
                    itemId: wishlistItem.id,
                    status: "archived",
                  })
                }
              >
                {m.action_continue()}
              </AlertDialogClose>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {wishlistItem.status === "archived" && (
        <Button
          variant="outline"
          onClick={() =>
            archiveWishlistItem.mutate({
              itemId: wishlistItem.id,
              status: "active",
            })
          }
        >
          <ArchiveIcon />
          <span>{m.item_activate()}</span>
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
} & React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
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
