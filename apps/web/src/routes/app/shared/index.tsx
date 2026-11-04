import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CircleSlash2Icon } from "lucide-react";

import { m } from "@wishbeam/intl/messages";
import { Wishlist, WishlistList } from "~/components/app/wishlist";
import { PageLayout } from "~/components/page-layout";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { sharedWishlistsQueryOptions } from "~/queries/wishlists";

export const Route = createFileRoute("/app/shared/")({
  loader: async ({ context }) => {
    await context.queryClient.query({ ...sharedWishlistsQueryOptions, staleTime: "static" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: wishlists } = useSuspenseQuery(sharedWishlistsQueryOptions);

  if (wishlists.length === 0) {
    return (
      <PageLayout>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CircleSlash2Icon />
            </EmptyMedia>
            <EmptyTitle>{m.wishlist_emptyTitle()}</EmptyTitle>
            <EmptyDescription>{m.wishlist_sharedEmptyDescription()}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <WishlistList>
        {wishlists.map((wishlist) => (
          <Wishlist key={wishlist.id} wishlist={wishlist} targetPage="/app/shared/$id" />
        ))}
      </WishlistList>
    </PageLayout>
  );
}
