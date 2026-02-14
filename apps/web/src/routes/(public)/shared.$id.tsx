import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { LockButton } from "~/components/app/lock-button";
import {
  WishlistItem,
  WishlistItemExpanded,
  WishlistItemsEmptyPublic,
  WishlistItemsList,
} from "~/components/app/wishlist-items";
import { LoginDialog } from "~/components/login";
import { Logo } from "~/components/logo";
import { PageLayout } from "~/components/page-layout";
import { DialogTrigger } from "~/components/ui/dialog";
import { ItemFooter } from "~/components/ui/item";
import { Separator } from "~/components/ui/separator";
import { usePublicWishlistCacheInvalidation } from "~/hooks/use-cache-invalidation";
import { useTRPC } from "~/lib/trpc";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/(public)/shared/$id")({
  beforeLoad: ({ context, params }) => {
    if (context.auth.loggedIn) {
      throw redirect({ to: "/app/shared/$id", params: { id: params.id } });
    }
  },
  loader: async ({ context, params }) => {
    const [wishlist, _] = await Promise.all([
      context.queryClient.ensureQueryData(
        context.trpc.wishlists.public.getById.queryOptions({
          wishlistId: params.id,
        }),
      ),
      context.queryClient.ensureQueryData(
        context.trpc.wishlists.public.items.getAll.queryOptions({
          wishlistId: params.id,
        }),
      ),
    ]);
    return {
      title: wishlist.wishlist.title,
      description: wishlist.wishlist.description,
    };
  },
  head: ({ loaderData }) => {
    return loaderData
      ? {
          meta: seo({
            title: loaderData.title,
            description: loaderData.description,
          }),
        }
      : {};
  },
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();

  const wishlistId = Route.useParams({ select: (state) => state.id });
  const { data: wishlist } = useSuspenseQuery(
    trpc.wishlists.public.getById.queryOptions({ wishlistId }, { select: (data) => data.wishlist }),
  );

  const { data: wishlistItems } = useSuspenseQuery(
    trpc.wishlists.public.items.getAll.queryOptions(
      { wishlistId },
      { select: (data) => data.wishlistItems },
    ),
  );

  usePublicWishlistCacheInvalidation(wishlistId);

  return (
    <div className="flex h-[100svh] flex-col">
      <div className="flex w-full items-center px-4 py-2.5">
        <Logo withName />
      </div>
      <Separator />
      <main className="grow overflow-y-auto">
        <PageLayout>
          <WishlistItemExpanded wishlist={wishlist}>
            {wishlistItems.length === 0 && <WishlistItemsEmptyPublic />}
            {wishlistItems.length > 0 && (
              <WishlistItemsList>
                {wishlistItems.map((wishlistItem) => (
                  <WishlistItem key={wishlistItem.id} wishlistItem={wishlistItem}>
                    <ItemFooter className="flex">
                      <LoginDialog>
                        <DialogTrigger
                          className="grow"
                          render={<LockButton lockStatus={wishlistItem.lockStatus} />}
                        />
                      </LoginDialog>
                    </ItemFooter>
                  </WishlistItem>
                ))}
              </WishlistItemsList>
            )}
          </WishlistItemExpanded>
        </PageLayout>
      </main>
    </div>
  );
}
