import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import {
  EditIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  PlusIcon,
  Share2Icon,
  TrashIcon,
} from 'lucide-react';
import z from 'zod';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
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
  .validator(z.object({ wishlistId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      return await context.trpc.ownedWishlist.getById(data);
    } catch {
      throw notFound();
    }
  });

const wishlistGetItemsServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .validator(z.object({ wishlistId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      return await context.trpc.ownedWishlist.getItems(data);
    } catch {
      throw notFound();
    }
  });

export const Route = createFileRoute('/app/wishlists/$id')({
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: context.trpc.ownedWishlist.getById.queryKey({
          wishlistId: params.id,
        }),
        queryFn: () =>
          wishlistGetByIdServerFn({ data: { wishlistId: params.id } }),
      }),
      context.queryClient.ensureQueryData({
        queryKey: context.trpc.ownedWishlist.getItems.queryKey({
          wishlistId: params.id,
        }),
        queryFn: () =>
          wishlistGetItemsServerFn({ data: { wishlistId: params.id } }),
      }),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const navigate = useNavigate();

  const wishlistId = Route.useParams({ select: (state) => state.id });
  const { data: wishlist } = useSuspenseQuery(
    trpc.ownedWishlist.getById.queryOptions(
      { wishlistId },
      { select: (data) => data.wishlist },
    ),
  );
  const deleteWishlist = useDeleteWishlistMutation();
  const [editOpen, setEditOpen] = useState(false);

  const { data: wishlistItems } = useSuspenseQuery(
    trpc.ownedWishlist.getItems.queryOptions(
      { wishlistId },
      { select: (data) => data.wishlistItems },
    ),
  );

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
                      deleteWishlist.mutate({ wishlistId });
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
        <div className="grid grid-cols-1 gap-8 p-4 md:grid-cols-2">
          {wishlistItems.map((wishlistItem) => (
            <Card key={wishlistItem.id} className="">
              <CardHeader>
                <CardTitle>{wishlistItem.title}</CardTitle>
                <CardDescription>{wishlistItem.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {wishlistItem.links.map((link) => (
                  <Item size="sm" asChild>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={link}
                      className="text-ellipsis"
                    >
                      <ItemContent>
                        <ItemTitle key={link}>{link}</ItemTitle>
                      </ItemContent>
                      <ItemActions>
                        <ExternalLinkIcon />
                      </ItemActions>
                    </a>
                  </Item>
                ))}
              </CardContent>
            </Card>
          ))}
          <Card className="h-40 transition-colors hover:bg-accent/50">
            <CardHeader className="text-center">
              <CardTitle>Add Item</CardTitle>
              <CardDescription className="sr-only">
                Add a new item to this wishlist
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <PlusIcon size="40px" />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
