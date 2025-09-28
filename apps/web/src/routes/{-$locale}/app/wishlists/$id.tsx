import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';

import { Separator } from '~/components/ui/separator';

import { useTRPC } from '~/lib/trpc';
import { wishlistGetByIdServerFn } from '~/lib/trpc-server';

export const Route = createFileRoute('/{-$locale}/app/wishlists/$id')({
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
      <div className="flex flex-col gap-2 px-4">
        <h2 className="text-lg font-medium">{wishlist.title}</h2>
        <p className="text-sm text-muted-foreground">{wishlist.description}</p>
      </div>
      <div className="px-2">
        <Separator />
      </div>
    </div>
  );
}
