import type { TRPCOutput } from '@wishbeam/trpc';

interface Props {
  wishlist: TRPCOutput['wishlist']['getOwned']['wishlists'][number];
}

export function WishlistCard({ wishlist }: Props) {
  return (
    <div className="grid grid-cols-[minmax(0,_256px)_minmax(0,_1fr)_auto] gap-6 rounded-xl border bg-card px-4 py-6 text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-input/50">
      <h2 className="grow text-lg font-medium">{wishlist.title}</h2>
      <div className="grow" />
      {wishlist.description && (
        <p className="text-sm text-muted-foreground">{wishlist.description}</p>
      )}
    </div>
  );
}
