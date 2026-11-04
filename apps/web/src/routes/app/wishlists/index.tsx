import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CircleSlash2Icon, GiftIcon } from "lucide-react";

import { m } from "@wishbeam/intl/messages";
import { CreateWishlistButton, Wishlist, WishlistList } from "~/components/app/wishlist";
import { PageLayout } from "~/components/page-layout";
import { Button } from "~/components/ui/button";
import { DialogTrigger } from "~/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { allWishlistsQueryOptions } from "~/queries/wishlists";

import { CreateWishlistDialog } from "./-/wishlist-form";

export const Route = createFileRoute("/app/wishlists/")({
  loader: async ({ context }) => {
    await context.queryClient.query({ ...allWishlistsQueryOptions, staleTime: "static" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: wishlists } = useSuspenseQuery(allWishlistsQueryOptions);

  if (wishlists.length === 0) {
    return (
      <PageLayout>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CircleSlash2Icon />
            </EmptyMedia>
            <EmptyTitle>{m.wishlist_emptyTitle()}</EmptyTitle>
            <EmptyDescription>{m.wishlist_emptyDescription()}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateWishlistDialog>
              <DialogTrigger className="mx-4 w-full" render={<Button />}>
                <GiftIcon />
                <span>{m.wishlist_createEmpty()}</span>
              </DialogTrigger>
            </CreateWishlistDialog>
          </EmptyContent>
        </Empty>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <WishlistList>
        {wishlists.map((wishlist) => (
          <Wishlist key={wishlist.id} wishlist={wishlist} targetPage="/app/wishlists/$id" />
        ))}
        <CreateWishlistButton />
      </WishlistList>
    </PageLayout>
  );
}
