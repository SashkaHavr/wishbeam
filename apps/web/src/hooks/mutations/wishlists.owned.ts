import { useMutation } from '@tanstack/react-query';

import { useTRPC } from '~/lib/trpc';

export function useCreateWishlistMutation() {
  const trpc = useTRPC();
  return useMutation(
    trpc.wishlists.owned.create.mutationOptions({
      onSuccess: (response, input, onMutateResult, context) => {
        context.client.setQueryData(
          trpc.wishlists.owned.getAll.queryKey(),
          (old) =>
            old
              ? { wishlists: [...old.wishlists, response.wishlist] }
              : { wishlists: [response.wishlist] },
        );
        void context.client.invalidateQueries({
          queryKey: trpc.wishlists.owned.getAll.queryKey(),
        });
      },
    }),
  );
}

export function useUpdateWishlistMutation() {
  const trpc = useTRPC();
  return useMutation(
    trpc.wishlists.owned.update.mutationOptions({
      onMutate: async (input, context) => {
        await context.client.cancelQueries({
          queryKey: trpc.wishlists.owned.getAll.queryKey(),
        });
        await context.client.cancelQueries({
          queryKey: trpc.wishlists.owned.getById.queryKey({
            wishlistId: input.wishlistId,
          }),
        });

        const previous = {
          all: context.client.getQueryData(
            trpc.wishlists.owned.getAll.queryKey(),
          ),
          byId: context.client.getQueryData(
            trpc.wishlists.owned.getById.queryKey({
              wishlistId: input.wishlistId,
            }),
          ),
        };

        context.client.setQueryData(
          trpc.wishlists.owned.getAll.queryKey(),
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
          trpc.wishlists.owned.getById.queryKey({
            wishlistId: input.wishlistId,
          }),
          (old) => old && { wishlist: { ...old.wishlist, ...input.data } },
        );

        return { previous };
      },
      onError: (err, input, onMutateResult, context) => {
        if (!onMutateResult) return;
        context.client.setQueryData(
          trpc.wishlists.owned.getAll.queryKey(),
          onMutateResult.previous.all,
        );
        context.client.setQueryData(
          trpc.wishlists.owned.getById.queryKey({
            wishlistId: input.wishlistId,
          }),
          onMutateResult.previous.byId,
        );
      },
      onSettled: (response, error, input, onMutateResult, context) => {
        void context.client.invalidateQueries({
          queryKey: trpc.wishlists.owned.getAll.queryKey(),
        });
        void context.client.invalidateQueries({
          queryKey: trpc.wishlists.owned.getById.queryKey({
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
    trpc.wishlists.owned.delete.mutationOptions({
      onMutate: async (input, context) => {
        await context.client.cancelQueries({
          queryKey: trpc.wishlists.owned.getAll.queryKey(),
        });
        await context.client.cancelQueries({
          queryKey: trpc.wishlists.owned.getById.queryKey({
            wishlistId: input.wishlistId,
          }),
        });

        const previous = {
          all: context.client.getQueryData(
            trpc.wishlists.owned.getAll.queryKey(),
          ),
        };

        context.client.setQueryData(
          trpc.wishlists.owned.getAll.queryKey(),
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
          trpc.wishlists.owned.getAll.queryKey(),
          onMutateResult.previous.all,
        );
      },
      onSuccess: (response, input, onMutateResult, context) => {
        void context.client.removeQueries({
          queryKey: trpc.wishlists.owned.getById.queryKey({
            wishlistId: input.wishlistId,
          }),
        });
      },
      onSettled: (response, error, input, onMutateResult, context) => {
        void context.client.invalidateQueries({
          queryKey: trpc.wishlists.owned.getAll.queryKey(),
        });
      },
    }),
  );
}

export function useSetShareStatusWishlistMutation() {
  const trpc = useTRPC();
  return useMutation(
    trpc.wishlists.owned.setShareStatus.mutationOptions({
      onMutate: async (input, context) => {
        await context.client.cancelQueries({
          queryKey: trpc.wishlists.owned.getAll.queryKey(),
        });
        await context.client.cancelQueries({
          queryKey: trpc.wishlists.owned.getById.queryKey({
            wishlistId: input.wishlistId,
          }),
        });

        const previous = {
          all: context.client.getQueryData(
            trpc.wishlists.owned.getAll.queryKey(),
          ),
          byId: context.client.getQueryData(
            trpc.wishlists.owned.getById.queryKey({
              wishlistId: input.wishlistId,
            }),
          ),
        };

        context.client.setQueryData(
          trpc.wishlists.owned.getAll.queryKey(),
          (old) =>
            old && {
              wishlists: old.wishlists.map((wishlist) =>
                wishlist.id === input.wishlistId
                  ? { ...wishlist, shareStatus: input.shareStatus }
                  : wishlist,
              ),
            },
        );
        context.client.setQueryData(
          trpc.wishlists.owned.getById.queryKey({
            wishlistId: input.wishlistId,
          }),
          (old) =>
            old && {
              wishlist: { ...old.wishlist, shareStatus: input.shareStatus },
            },
        );

        return { previous };
      },
      onError: (err, input, onMutateResult, context) => {
        if (!onMutateResult) return;
        context.client.setQueryData(
          trpc.wishlists.owned.getAll.queryKey(),
          onMutateResult.previous.all,
        );
        context.client.setQueryData(
          trpc.wishlists.owned.getById.queryKey({
            wishlistId: input.wishlistId,
          }),
          onMutateResult.previous.byId,
        );
      },
      onSettled: (response, error, input, onMutateResult, context) => {
        void context.client.invalidateQueries({
          queryKey: trpc.wishlists.owned.getAll.queryKey(),
        });
        void context.client.invalidateQueries({
          queryKey: trpc.wishlists.owned.getById.queryKey({
            wishlistId: input.wishlistId,
          }),
        });
      },
    }),
  );
}
