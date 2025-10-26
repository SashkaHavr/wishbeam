import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { LockIcon } from 'lucide-react';
import z from 'zod';

import { ItemFooter } from '~/components/ui/item';

import { AppDialogTrigger } from '~/components/app-dialog';
import {
  WishlistItem,
  WishlistItemExpanded,
  WishlistItemsEmptyPublic,
  WishlistItemsList,
} from '~/components/app/wishlist-items';
import { LoginDialog } from '~/components/login';
import { PageLayout } from '~/components/page-layout';
import { useTRPC } from '~/lib/trpc';
import { trpcServerFnMiddleware } from '~/lib/trpc-server';

const wishlistPublicGetByIdServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .validator(z.object({ wishlistId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      return await context.trpc.wishlists.public.getById(data);
    } catch {
      throw notFound();
    }
  });

const wishlistPublicGetItemsServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .validator(z.object({ wishlistId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      return await context.trpc.wishlists.public.items.getAll(data);
    } catch {
      throw notFound();
    }
  });

export const Route = createFileRoute('/(public)/shared/$id')({
  beforeLoad: ({ context, params }) => {
    if (context.auth.loggedIn) {
      throw redirect({ to: '/app/shared/$id', params: { id: params.id } });
    }
  },
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: context.trpc.wishlists.public.getById.queryKey({
          wishlistId: params.id,
        }),
        queryFn: () =>
          wishlistPublicGetByIdServerFn({ data: { wishlistId: params.id } }),
      }),
      context.queryClient.ensureQueryData({
        queryKey: context.trpc.wishlists.public.items.getAll.queryKey({
          wishlistId: params.id,
        }),
        queryFn: () =>
          wishlistPublicGetItemsServerFn({ data: { wishlistId: params.id } }),
      }),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();

  const wishlistId = Route.useParams({ select: (state) => state.id });
  const { data: wishlist } = useSuspenseQuery(
    trpc.wishlists.public.getById.queryOptions(
      { wishlistId },
      { select: (data) => data.wishlist },
    ),
  );

  const { data: wishlistItems } = useSuspenseQuery(
    trpc.wishlists.public.items.getAll.queryOptions(
      { wishlistId },
      { select: (data) => data.wishlistItems },
    ),
  );

  return (
    <PageLayout>
      <WishlistItemExpanded wishlist={wishlist}>
        {wishlistItems.length === 0 && <WishlistItemsEmptyPublic />}
        {wishlistItems.length > 0 && (
          <WishlistItemsList>
            {wishlistItems.map((wishlistItem) => (
              <WishlistItem key={wishlistItem.id} wishlistItem={wishlistItem}>
                <ItemFooter className="flex">
                  <LoginDialog>
                    <AppDialogTrigger className="grow">
                      <LockIcon />
                      <span>Lock item</span>
                    </AppDialogTrigger>
                  </LoginDialog>
                </ItemFooter>
              </WishlistItem>
            ))}
          </WishlistItemsList>
        )}
      </WishlistItemExpanded>
    </PageLayout>
  );
}
