import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { CircleSlash2Icon } from 'lucide-react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty';

import { Wishlist, WishlistList } from '~/components/app/wishlist';
import { PageLayout } from '~/components/page-layout';
import { useTRPC } from '~/lib/trpc';
import { trpcServerFnMiddleware } from '~/lib/trpc-server';

const wishlistsSharedGetAllServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .handler(async ({ context }) => {
    return context.trpc.wishlists.shared.getAll();
  });

export const Route = createFileRoute('/app/shared/')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: context.trpc.wishlists.shared.getAll.queryKey(),
      queryFn: () => wishlistsSharedGetAllServerFn(),
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const { data: wishlists } = useSuspenseQuery(
    trpc.wishlists.shared.getAll.queryOptions(void 0, {
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
              Nobody has shared any wishlists with you yet. 😢
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <WishlistList>
        {wishlists.map((wishlist) => (
          <Wishlist
            key={wishlist.id}
            wishlist={wishlist}
            targetPage="/app/shared/$id"
          />
        ))}
      </WishlistList>
    </PageLayout>
  );
}
