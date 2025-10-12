import { useMutation } from '@tanstack/react-query';

import { useTRPC } from '~/lib/trpc';

export function useCreateWishlistItemMutation() {
  const trpc = useTRPC();
  return useMutation(
    trpc.wishlists.owned.items.create.mutationOptions({
      onSuccess: (response, input, onMutateResult, context) => {
        context.client.setQueryData(
          trpc.wishlists.owned.items.getAll.queryKey({
            wishlistId: input.wishlistId,
          }),
          (old) =>
            old
              ? { wishlistItems: [...old.wishlistItems, response.wishlistItem] }
              : { wishlistItems: [response.wishlistItem] },
        );
        void context.client.invalidateQueries({
          queryKey: trpc.wishlists.owned.items.getAll.queryKey({
            wishlistId: input.wishlistId,
          }),
        });
      },
    }),
  );
}

export function useUpdateWishlistItemMutation({
  wishlistId,
}: {
  wishlistId: string;
}) {
  const trpc = useTRPC();
  return useMutation(
    trpc.wishlists.owned.items.update.mutationOptions({
      onMutate: async (input, context) => {
        await context.client.cancelQueries({
          queryKey: trpc.wishlists.owned.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
        });

        const previous = context.client.getQueryData(
          trpc.wishlists.owned.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
        );

        context.client.setQueryData(
          trpc.wishlists.owned.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
          (old) => {
            return (
              old && {
                wishlistItems: old.wishlistItems.map((wishlistItem) =>
                  wishlistItem.id === input.wishlistItemId
                    ? { ...wishlistItem, ...input.data }
                    : wishlistItem,
                ),
              }
            );
          },
        );

        return { previous };
      },
      onError: (err, input, onMutateResult, context) => {
        if (!onMutateResult) return;
        context.client.setQueryData(
          trpc.wishlists.owned.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
          onMutateResult.previous,
        );
      },
      onSettled: (response, error, input, onMutateResult, context) => {
        void context.client.invalidateQueries({
          queryKey: trpc.wishlists.owned.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
        });
      },
    }),
  );
}

export function useDeleteWishlistItemMutation({
  wishlistId,
}: {
  wishlistId: string;
}) {
  const trpc = useTRPC();

  return useMutation(
    trpc.wishlists.owned.items.delete.mutationOptions({
      onMutate: async (input, context) => {
        await context.client.cancelQueries({
          queryKey: trpc.wishlists.owned.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
        });

        const previous = context.client.getQueryData(
          trpc.wishlists.owned.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
        );

        context.client.setQueryData(
          trpc.wishlists.owned.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
          (old) =>
            old && {
              wishlistItems: old.wishlistItems.filter(
                (wishlistItem) => wishlistItem.id !== input.wishlistItemId,
              ),
            },
        );

        return { previous };
      },
      onError: (err, input, onMutateResult, context) => {
        if (!onMutateResult) return;
        context.client.setQueryData(
          trpc.wishlists.owned.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
          onMutateResult.previous,
        );
      },
      onSettled: (response, error, input, onMutateResult, context) => {
        void context.client.invalidateQueries({
          queryKey: trpc.wishlists.owned.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
        });
      },
    }),
  );
}
