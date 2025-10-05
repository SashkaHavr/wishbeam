import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { EditIcon } from 'lucide-react';

import { Separator } from '~/components/ui/separator';

import { AppDialogTrigger } from '~/components/app-dialog';
import { UpdateWishlistDialog } from '~/components/app/update-wishlist-button';
import { useTRPC } from '~/lib/trpc';
import { wishlistGetByIdServerFn } from '~/lib/trpc-server';

export const Route = createFileRoute('/app/wishlists/$id')({
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.ensureQueryData({
        queryKey: context.trpc.wishlist.getById.queryKey({ id: params.id }),
        queryFn: () => wishlistGetByIdServerFn({ data: { id: params.id } }),
      });
    } catch {
      throw notFound();
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const wishlistId = Route.useParams({ select: (state) => state.id });
  const data = useSuspenseQuery(
    trpc.wishlist.getById.queryOptions({ id: wishlistId }),
  );
  const wishlist = data.data.wishlist;

  return (
    <div className="flex flex-col gap-4 pt-6 pb-4">
      <div className="flex px-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">{wishlist.title}</h2>
          <p className="text-sm text-muted-foreground">
            {wishlist.description}
          </p>
        </div>
        <div className="grow" />
        <UpdateWishlistDialog wishlist={wishlist}>
          <AppDialogTrigger variant="outline">
            <EditIcon />
          </AppDialogTrigger>
        </UpdateWishlistDialog>
      </div>
      <div className="px-2">
        <Separator />
      </div>
    </div>
  );
}
