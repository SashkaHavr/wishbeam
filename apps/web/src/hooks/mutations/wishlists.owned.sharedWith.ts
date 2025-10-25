import { useMutation } from '@tanstack/react-query';

import { useTRPC } from '~/lib/trpc';

export function useAddWishlistSharedWithMutation() {
  const trpc = useTRPC();
  return useMutation(
    trpc.wishlists.owned.sharedWith.add.mutationOptions({
      onSuccess: (response, input, onMutateResult, context) => {
        context.client.setQueryData(
          trpc.wishlists.owned.sharedWith.getAll.queryKey({
            wishlistId: input.wishlistId,
          }),
          (old) =>
            old
              ? { users: [...old.users, response.user] }
              : { users: [response.user] },
        );
        void context.client.invalidateQueries({
          queryKey: trpc.wishlists.owned.sharedWith.getAll.queryKey(),
        });
      },
    }),
  );
}

export function useDeleteWishlistSharedWithMutation() {
  const trpc = useTRPC();

  return useMutation(
    trpc.wishlists.owned.sharedWith.delete.mutationOptions({
      onMutate: async (input, context) => {
        await context.client.cancelQueries({
          queryKey: trpc.wishlists.owned.sharedWith.getAll.queryKey({
            wishlistId: input.wishlistId,
          }),
        });

        const previous = context.client.getQueryData(
          trpc.wishlists.owned.sharedWith.getAll.queryKey({
            wishlistId: input.wishlistId,
          }),
        );

        context.client.setQueryData(
          trpc.wishlists.owned.sharedWith.getAll.queryKey({
            wishlistId: input.wishlistId,
          }),
          (old) =>
            old && {
              users: old.users.filter((user) => user.id !== input.userId),
            },
        );

        return { previous };
      },
      onError: (err, input, onMutateResult, context) => {
        if (!onMutateResult) return;
        context.client.setQueryData(
          trpc.wishlists.owned.sharedWith.getAll.queryKey({
            wishlistId: input.wishlistId,
          }),
          onMutateResult.previous,
        );
      },
      onSettled: (response, error, input, onMutateResult, context) => {
        void context.client.invalidateQueries({
          queryKey: trpc.wishlists.owned.sharedWith.getAll.queryKey({
            wishlistId: input.wishlistId,
          }),
        });
      },
    }),
  );
}
