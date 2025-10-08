import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { EditIcon, EllipsisIcon, Share2Icon, TrashIcon } from 'lucide-react';
import z from 'zod';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '~/components/ui/item';
import { Separator } from '~/components/ui/separator';

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

  const [editOpen, setEditOpen] = useState(false);

  return (
    <PageLayout>
      <div className="flex flex-col">
        <Item>
          <ItemContent>
            <ItemTitle>
              <h2 className="text-lg font-medium">{wishlist.title}</h2>
            </ItemTitle>
            <ItemDescription>{wishlist.description}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button>
              <Share2Icon />
              Share
            </Button>
            <UpdateWishlistDialog
              wishlist={wishlist}
              state={{ open: editOpen, onOpenChange: setEditOpen }}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <EllipsisIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <EditIcon />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      deleteWishlist.mutate({ id: wishlist.id });
                      void navigate({ to: '/app/wishlists' });
                    }}
                  >
                    <TrashIcon />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </ItemActions>
        </Item>
        <div className="px-2">
          <Separator />
        </div>
      </div>
    </PageLayout>
  );
}
