import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { CircleSlash2Icon, GiftIcon, PlusIcon } from 'lucide-react';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty';

import { AppDialogTrigger } from '~/components/app-dialog';
import { CreateWishlistDialog } from '~/components/app/create-wishlist-dialog';
import { WishlistItem } from '~/components/app/wishlist-item';
import { PageLayout } from '~/components/page-layout';
import { useTRPC } from '~/lib/trpc';
import { wishlistsGetOwnedServerFn } from '~/lib/trpc-server';

export const Route = createFileRoute('/app/wishlists/')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: context.trpc.ownedWishlist.getAll.queryKey(),
      queryFn: () => wishlistsGetOwnedServerFn(),
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const wishlists = useSuspenseQuery(trpc.ownedWishlist.getAll.queryOptions());

  if (wishlists.data.wishlists.length === 0) {
    return (
      <div className="grid h-full grid-rows-1 items-center justify-items-center pb-20">
        <Empty className="row-[1]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CircleSlash2Icon />
            </EmptyMedia>
            <EmptyTitle>No Wishlists Yet</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t created any wishlists yet. Get started by
              creating your first wishlist.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateWishlistDialog>
              <AppDialogTrigger className="mx-4 w-full">
                <GiftIcon />
                <span>Create Wishlist</span>
              </AppDialogTrigger>
            </CreateWishlistDialog>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="flex flex-col gap-4">
        {wishlists.data.wishlists.map((wishlist) => (
          <WishlistItem key={wishlist.id} wishlist={wishlist} />
        ))}
        <CreateWishlistDialog>
          <AppDialogTrigger size="lg" variant="outline">
            <PlusIcon />
            <span>Create new wishlist</span>
          </AppDialogTrigger>
        </CreateWishlistDialog>
      </div>
    </PageLayout>
  );
}
