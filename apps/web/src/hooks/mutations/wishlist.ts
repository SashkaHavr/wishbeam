import { useMutation } from '@tanstack/react-query';

import { useTRPC } from '~/lib/trpc';

export function useCreateWishlistMutation() {
  const trpc = useTRPC();
  return useMutation(
    trpc.ownedWishlist.create.mutationOptions({
      onSuccess: (response, input, onMutateResult, context) => {
        context.client.setQueryData(
          trpc.ownedWishlist.getAll.queryKey(),
          (old) =>
            old
              ? { wishlists: [...old.wishlists, response.newWishlist] }
              : { wishlists: [response.newWishlist] },
        );
        void context.client.invalidateQueries({
          queryKey: trpc.ownedWishlist.getAll.queryKey(),
        });
      },
    }),
  );
}

export function useUpdateWishlistMutation() {
  const trpc = useTRPC();
  return useMutation(
    trpc.ownedWishlist.update.mutationOptions({
      onMutate: async (input, context) => {
        await context.client.cancelQueries({
          queryKey: trpc.ownedWishlist.getAll.queryKey(),
        });
        await context.client.cancelQueries({
          queryKey: trpc.ownedWishlist.getById.queryKey({
            wishlistId: input.wishlistId,
          }),
        });

        const previous = {
          all: context.client.getQueryData(
            trpc.ownedWishlist.getAll.queryKey(),
          ),
          byId: context.client.getQueryData(
            trpc.ownedWishlist.getById.queryKey({
              wishlistId: input.wishlistId,
            }),
          ),
        };

        context.client.setQueryData(
          trpc.ownedWishlist.getAll.queryKey(),
          (old) =>
            old && {
              wishlists: old.wishlists.map((wishlist) =>
                wishlist.id === input.wishlistId
                  ? { ...wishlist, ...input.data }
                  : wishlist,
              ),
            },
        );
        context.client.setQueryData(
          trpc.ownedWishlist.getById.queryKey({
            wishlistId: input.wishlistId,
          }),
          (old) => old && { wishlist: { ...old.wishlist, ...input.data } },
        );

        return { previous };
      },
      onError: (err, input, onMutateResult, context) => {
        if (!onMutateResult) return;
        context.client.setQueryData(
          trpc.ownedWishlist.getAll.queryKey(),
          onMutateResult.previous.all,
        );
        context.client.setQueryData(
          trpc.ownedWishlist.getById.queryKey({
            wishlistId: input.wishlistId,
          }),
          onMutateResult.previous.byId,
        );
      },
      onSettled: (response, error, input, onMutateResult, context) => {
        void context.client.invalidateQueries({
          queryKey: trpc.ownedWishlist.getAll.queryKey(),
        });
        void context.client.invalidateQueries({
          queryKey: trpc.ownedWishlist.getById.queryKey({
            wishlistId: input.wishlistId,
          }),
        });
      },
    }),
  );
}

export function useDeleteWishlistMutation() {
  const trpc = useTRPC();

  return useMutation(
    trpc.ownedWishlist.delete.mutationOptions({
      onMutate: async (input, context) => {
        await context.client.cancelQueries({
          queryKey: trpc.ownedWishlist.getAll.queryKey(),
        });
        await context.client.cancelQueries({
          queryKey: trpc.ownedWishlist.getById.queryKey({
            wishlistId: input.wishlistId,
          }),
        });

        const previous = {
          all: context.client.getQueryData(
            trpc.ownedWishlist.getAll.queryKey(),
          ),
        };

        context.client.setQueryData(
          trpc.ownedWishlist.getAll.queryKey(),
          (old) =>
            old && {
              wishlists: old.wishlists.filter(
                (wishlist) => wishlist.id !== input.wishlistId,
              ),
            },
        );

        return { previous };
      },
      onError: (err, input, onMutateResult, context) => {
        if (!onMutateResult) return;
        context.client.setQueryData(
          trpc.ownedWishlist.getAll.queryKey(),
          onMutateResult.previous.all,
        );
      },
      onSuccess: (response, input, onMutateResult, context) => {
        void context.client.removeQueries({
          queryKey: trpc.ownedWishlist.getById.queryKey({
            wishlistId: input.wishlistId,
          }),
        });
      },
      onSettled: (response, error, input, onMutateResult, context) => {
        void context.client.invalidateQueries({
          queryKey: trpc.ownedWishlist.getAll.queryKey(),
        });
      },
    }),
  );
}
