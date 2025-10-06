import { useMutation } from '@tanstack/react-query';

import { useTRPC } from '~/lib/trpc';

export function useCreateWishlistMutation() {
  const trpc = useTRPC();
  return useMutation(
    trpc.ownedWishlist.create.mutationOptions({
      onSuccess: async (data, values, onMutateResult, context) => {
        context.client.setQueryData(
          trpc.ownedWishlist.getAll.queryKey(),
          (old) =>
            old
              ? { wishlists: [...old.wishlists, data.newWishlist] }
              : { wishlists: [data.newWishlist] },
        );
        await context.client.invalidateQueries({
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
      onMutate: async (values, context) => {
        await context.client.cancelQueries({
          queryKey: trpc.ownedWishlist.getAll.queryKey(),
        });
        await context.client.cancelQueries({
          queryKey: trpc.ownedWishlist.getById.queryKey({ id: values.id }),
        });

        const previous = {
          all: context.client.getQueryData(
            trpc.ownedWishlist.getAll.queryKey(),
          ),
          byId: context.client.getQueryData(
            trpc.ownedWishlist.getById.queryKey({ id: values.id }),
          ),
        };

        context.client.setQueryData(
          trpc.ownedWishlist.getAll.queryKey(),
          (old) =>
            old && {
              wishlists: old.wishlists.map((wishlist) =>
                wishlist.id === values.id
                  ? { ...wishlist, ...values.data }
                  : wishlist,
              ),
            },
        );
        context.client.setQueryData(
          trpc.ownedWishlist.getById.queryKey({ id: values.id }),
          (old) => old && { wishlist: { ...old.wishlist, ...values.data } },
        );

        return { previous };
      },
      onError: (err, values, onMutateResult, context) => {
        if (!onMutateResult) return;
        context.client.setQueryData(
          trpc.ownedWishlist.getAll.queryKey(),
          onMutateResult.previous.all,
        );
        context.client.setQueryData(
          trpc.ownedWishlist.getById.queryKey({ id: values.id }),
          onMutateResult.previous.byId,
        );
      },
      onSettled: async (data, error, values, onMutateResult, context) => {
        await context.client.invalidateQueries({
          queryKey: trpc.ownedWishlist.getAll.queryKey(),
        });
        await context.client.invalidateQueries({
          queryKey: trpc.ownedWishlist.getById.queryKey({ id: values.id }),
        });
      },
    }),
  );
}

export function useDeleteWishlistMutation() {
  const trpc = useTRPC();

  return useMutation(
    trpc.ownedWishlist.delete.mutationOptions({
      onMutate: async (values, context) => {
        await context.client.cancelQueries({
          queryKey: trpc.ownedWishlist.getAll.queryKey(),
        });
        await context.client.cancelQueries({
          queryKey: trpc.ownedWishlist.getById.queryKey({ id: values.id }),
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
                (wishlist) => wishlist.id !== values.id,
              ),
            },
        );

        return { previous };
      },
      onError: (err, values, onMutateResult, context) => {
        if (!onMutateResult) return;
        context.client.setQueryData(
          trpc.ownedWishlist.getAll.queryKey(),
          onMutateResult.previous.all,
        );
      },
      onSuccess: async (data, values, onMutateResult, context) => {
        await context.client.resetQueries({
          queryKey: trpc.ownedWishlist.getById.queryKey({ id: values.id }),
        });
      },
      onSettled: async (data, error, values, onMutateResult, context) => {
        await context.client.invalidateQueries({
          queryKey: trpc.ownedWishlist.getAll.queryKey(),
        });
      },
    }),
  );
}
