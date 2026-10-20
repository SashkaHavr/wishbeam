import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowDownIcon, ArrowUpIcon, EditIcon, Share2Icon, UserPlusIcon } from "lucide-react";

import type { ApiErrors, ApiOutput } from "@wishbeam/api-contract";
import type { IdBranded } from "@wishbeam/db/id-branded";
import { m } from "@wishbeam/intl/messages";
import { DeleteAlertDialog } from "~/components/alerts/delete-alert-dialog";
import {
  ArchiveWishlistItemButton,
  CreateWishlistItemButton,
  DeleteWishlistItemButton,
  UpdateWishlistItemButton,
  WishlistItem,
  WishlistItemExpanded,
  WishlistItemsEmpty,
  WishlistItemsList,
} from "~/components/app/wishlist-items";
import { PageLayout } from "~/components/page-layout";
import { Button } from "~/components/ui/button";
import { DialogTrigger } from "~/components/ui/dialog";
import { Group, GroupSeparator } from "~/components/ui/group";
import { ItemActions, ItemFooter } from "~/components/ui/item";
import { Separator } from "~/components/ui/separator";
import { parseWishlistParams, stringifyWishlistParams } from "~/lib/wishlist-params";
import {
  isOwnedQueryOptions,
  useDeleteWishlist,
  useMoveWishlistItem,
  wishlistItemsQueryOptions,
  wishlistQueryOptions,
} from "~/queries/wishlists";

import { UpdateOwnersDialog } from "./-/owners";
import { ShareWishlistDialog } from "./-/sharing";
import { UpdateWishlistDialog } from "./-/wishlist-form";

export const Route = createFileRoute("/app/wishlists/$id")({
  params: { parse: parseWishlistParams, stringify: stringifyWishlistParams },
  beforeLoad: async ({ context, params }) => {
    const isOwnedWishlist = await context.queryClient.query({
      ...isOwnedQueryOptions(params.id),
      staleTime: "static",
    });
    if (!isOwnedWishlist) {
      throw redirect({ to: "/app/shared/$id", params: { id: params.id } });
    }
  },
  loader: async ({ context, params }) => {
    try {
      await Promise.all([
        context.queryClient.query({ ...wishlistQueryOptions(params.id), staleTime: "static" }),
        context.queryClient.query({ ...wishlistItemsQueryOptions(params.id), staleTime: "static" }),
      ]);
    } catch (err) {
      const error = err as ApiErrors["wishlists"]["get"];
      if (error._tag === "WishlistNotFound") throw notFound();
      throw error;
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const wishlistId = Route.useParams({ select: (state) => state.id });
  const { data: wishlist } = useSuspenseQuery(wishlistQueryOptions(wishlistId));
  const deleteWishlist = useDeleteWishlist();

  const { data: wishlistItems } = useSuspenseQuery(wishlistItemsQueryOptions(wishlistId));

  const activeWishlistItems = wishlistItems.filter((item) => item.status === "active");
  const archivedWishlistItems = wishlistItems.filter((item) => item.status === "archived");

  return (
    <PageLayout>
      <WishlistItemExpanded
        wishlist={wishlist}
        itemChildren={
          <>
            <ItemActions>
              <ShareWishlistDialog wishlist={wishlist}>
                <DialogTrigger render={<Button />}>
                  <Share2Icon />
                  {m.wishlist_share()}
                </DialogTrigger>
              </ShareWishlistDialog>
            </ItemActions>
            <ItemFooter className="grid grid-cols-2 pt-2">
              <UpdateWishlistDialog wishlist={wishlist}>
                <DialogTrigger render={<Button variant="outline" />}>
                  <EditIcon />
                  <span>{m.action_edit()}</span>
                </DialogTrigger>
              </UpdateWishlistDialog>
              {wishlist.currentUserIsCreator && (
                <UpdateOwnersDialog wishlistId={wishlist.id}>
                  <DialogTrigger render={<Button variant="outline" />}>
                    <UserPlusIcon />
                    <span>{m.wishlist_addOwner()}</span>
                  </DialogTrigger>
                </UpdateOwnersDialog>
              )}
              {wishlist.currentUserIsCreator && (
                <DeleteAlertDialog
                  onClick={() => {
                    void navigate({ to: "/app/wishlists" }).then(() =>
                      deleteWishlist.mutate(wishlistId),
                    );
                  }}
                />
              )}
            </ItemFooter>
          </>
        }
      >
        {wishlistItems.length === 0 && <WishlistItemsEmpty wishlistId={wishlistId} />}
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
                  <h3 className="text-xl font-medium">{m.item_archived()}</h3>
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
  wishlistItem: ApiOutput["wishlistItems"]["getAll"][number];
  wishlistId: IdBranded<"wishlist">;
}) {
  return (
    <WishlistItem wishlistItem={wishlistItem}>
      <ItemFooter className="grid grid-cols-2">
        <UpdateWishlistItemButton wishlistItem={wishlistItem} wishlistId={wishlistId} />
        <DeleteWishlistItemButton wishlistItemId={wishlistItem.id} wishlistId={wishlistId} />
        <ArchiveWishlistItemButton wishlistItem={wishlistItem} wishlistId={wishlistId} />
        <WishlistItemOrderButtons wishlistId={wishlistId} wishlistItemId={wishlistItem.id} />
      </ItemFooter>
    </WishlistItem>
  );
}

function WishlistItemOrderButtons({
  wishlistId,
  wishlistItemId,
}: {
  wishlistId: IdBranded<"wishlist">;
  wishlistItemId: IdBranded<"wishlist-item">;
}) {
  const move = useMoveWishlistItem(wishlistId);

  return (
    <Group className="w-full">
      <Button
        className="grow"
        variant="outline"
        aria-label={m.item_moveUp()}
        onClick={() => move.mutate({ itemId: wishlistItemId, direction: "up" })}
      >
        <ArrowUpIcon />
      </Button>
      <GroupSeparator />
      <Button
        className="grow"
        variant="outline"
        aria-label={m.item_moveDown()}
        onClick={() => move.mutate({ itemId: wishlistItemId, direction: "down" })}
      >
        <ArrowDownIcon />
      </Button>
    </Group>
  );
}
