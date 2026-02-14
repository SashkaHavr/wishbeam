import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CircleSlash2Icon, GiftIcon } from "lucide-react";

import { CreateWishlistDialog } from "~/components/app/create-wishlist-dialog";
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
import { useTRPC } from "~/lib/trpc";

export const Route = createFileRoute("/app/wishlists/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(context.trpc.wishlists.owned.getAll.queryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const { data: wishlists } = useSuspenseQuery(
    trpc.wishlists.owned.getAll.queryOptions(void 0, {
      select: (data) => data.wishlists,
    }),
  );

  if (wishlists.length === 0) {
    return (
      <PageLayout>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CircleSlash2Icon />
            </EmptyMedia>
            <EmptyTitle>No Wishlists Yet</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t created any wishlists yet. Get started by creating your first
              wishlist.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateWishlistDialog>
              <DialogTrigger className="mx-4 w-full" render={<Button />}>
                <GiftIcon />
                <span>Create Wishlist</span>
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
