import { useMutation } from '@tanstack/react-query';

import { useTRPC } from '~/lib/trpc';

export function useLockWishlistItemMutation(wishlistId: string) {
  const trpc = useTRPC();
  return useMutation(
    trpc.wishlists.shared.items.lock.mutationOptions({
      onMutate: async (input, context) => {
        await context.client.cancelQueries({
          queryKey: trpc.wishlists.shared.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
        });

        const previous = context.client.getQueryData(
          trpc.wishlists.shared.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
        );

        context.client.setQueryData(
          trpc.wishlists.shared.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
          (old) => {
            return (
              old && {
                wishlistItems: old.wishlistItems.map((wishlistItem) =>
                  wishlistItem.id === input.wishlistItemId
                    ? {
                        ...wishlistItem,
                        lockStatus: 'lockedByCurrentUser' as const,
                      }
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
          trpc.wishlists.shared.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
          onMutateResult.previous,
        );
      },
      onSettled: (response, error, input, onMutateResult, context) => {
        void context.client.invalidateQueries({
          queryKey: trpc.wishlists.shared.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
        });
      },
    }),
  );
}

export function useUnlockWishlistItemMutation(wishlistId: string) {
  const trpc = useTRPC();
  return useMutation(
    trpc.wishlists.shared.items.unlock.mutationOptions({
      onMutate: async (input, context) => {
        await context.client.cancelQueries({
          queryKey: trpc.wishlists.shared.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
        });

        const previous = context.client.getQueryData(
          trpc.wishlists.shared.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
        );

        context.client.setQueryData(
          trpc.wishlists.shared.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
          (old) => {
            return (
              old && {
                wishlistItems: old.wishlistItems.map((wishlistItem) =>
                  wishlistItem.id === input.wishlistItemId
                    ? {
                        ...wishlistItem,
                        lockStatus: 'unlocked' as const,
                      }
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
          trpc.wishlists.shared.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
          onMutateResult.previous,
        );
      },
      onSettled: (response, error, input, onMutateResult, context) => {
        void context.client.invalidateQueries({
          queryKey: trpc.wishlists.shared.items.getAll.queryKey({
            wishlistId: wishlistId,
          }),
        });
      },
    }),
  );
}
