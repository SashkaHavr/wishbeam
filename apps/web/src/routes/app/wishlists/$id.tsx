import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { EditIcon, TrashIcon } from 'lucide-react';
import z from 'zod';

import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';

import { AppDialogTrigger } from '~/components/app-dialog';
import { UpdateWishlistDialog } from '~/components/app/update-wishlist-button';
import { PageLayout } from '~/components/page-layout';
import { useDeleteWishlistMutation } from '~/hooks/mutations/wishlist';
import { useTRPC } from '~/lib/trpc';
import { trpcServerFnMiddleware } from '~/lib/trpc-server';

const wishlistGetByIdServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      return await context.trpc.ownedWishlist.getById(data);
    } catch {
      throw notFound();
    }
  });

export const Route = createFileRoute('/app/wishlists/$id')({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: context.trpc.ownedWishlist.getById.queryKey({
        id: params.id,
      }),
      queryFn: () => wishlistGetByIdServerFn({ data: { id: params.id } }),
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const wishlistId = Route.useParams({ select: (state) => state.id });
  const data = useSuspenseQuery(
    trpc.ownedWishlist.getById.queryOptions({ id: wishlistId }),
  );
  const wishlist = data.data.wishlist;
  const navigate = useNavigate();

  const deleteWishlist = useDeleteWishlistMutation();

  return (
    <PageLayout>
      <div className="flex flex-col gap-4">
        <div className="flex px-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-medium">{wishlist.title}</h2>
            <p className="text-sm text-muted-foreground">
              {wishlist.description}
            </p>
          </div>
          <div className="grow" />
          <div className="flex gap-1">
            <UpdateWishlistDialog wishlist={wishlist}>
              <AppDialogTrigger variant="outline" size="icon">
                <EditIcon />
              </AppDialogTrigger>
            </UpdateWishlistDialog>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                deleteWishlist.mutate({ id: wishlist.id });
                void navigate({ to: '/app/wishlists' });
              }}
            >
              <TrashIcon />
            </Button>
          </div>
        </div>
        <div className="px-2">
          <Separator />
        </div>
      </div>
    </PageLayout>
  );
}
