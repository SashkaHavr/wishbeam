import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { CreateWishlistButton } from '~/components/app/create-wishlist-button';
import { WishlistCard } from '~/components/app/wishlist-card';
import { useTRPC } from '~/lib/trpc';
import { wishlistsGetOwnedServerFn } from '~/lib/trpc-server';

export const Route = createFileRoute('/{-$locale}/app/wishlists')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: context.trpc.wishlist.getOwned.queryKey(),
      queryFn: () => wishlistsGetOwnedServerFn(),
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const wishlists = useSuspenseQuery(trpc.wishlist.getOwned.queryOptions());

  return (
    <div className="grid w-full grid-cols-[minmax(0,_1fr)_minmax(0,_768px)_minmax(0,_1fr)] px-4 pt-10 pb-4">
      <div className="col-[1]" />
      <div className="col-[2] flex flex-col gap-4">
        {wishlists.data.wishlists.map((wishlist) => (
          <WishlistCard key={wishlist.id} wishlist={wishlist} />
        ))}
        <CreateWishlistButton />
      </div>
      <div className="col-[3]" />
    </div>
  );
}
