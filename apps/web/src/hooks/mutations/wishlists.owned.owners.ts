import { useMutation } from '@tanstack/react-query';

import { useTRPC } from '~/lib/trpc';

export function useAddWishlistOwnerMutation() {
  const trpc = useTRPC();
  return useMutation(
    trpc.wishlists.owned.owners.add.mutationOptions({
      onMutate: async (input, context) => {
        await context.client.cancelQueries({
          queryKey: trpc.wishlists.owned.owners.getAll.queryKey({
            wishlistId: input.wishlistId,
          }),
        });

        const previous = context.client.getQueryData(
          trpc.wishlists.owned.owners.getAll.queryKey({
            wishlistId: input.wishlistId,
          }),
        );

        context.client.setQueryData(
          trpc.wishlists.owned.owners.getAll.queryKey({
            wishlistId: input.wishlistId,
          }),
          (old) => {
            return old
              ? {
                  owners: [
                    ...old.owners,
                    { email: input.email, role: 'owner' as const },
                  ],
                }
              : { owners: [{ email: input.email, role: 'owner' as const }] };
          },
        );

        return { previous };
      },
      onError: (err, input, onMutateResult, context) => {
        if (!onMutateResult) return;
        context.client.setQueryData(
          trpc.wishlists.owned.owners.getAll.queryKey({
            wishlistId: input.wishlistId,
          }),
          onMutateResult.previous,
        );
      },
      onSettled: (response, error, input, onMutateResult, context) => {
        void context.client.invalidateQueries({
          queryKey: trpc.wishlists.owned.owners.getAll.queryKey({
            wishlistId: input.wishlistId,
          }),
        });
      },
    }),
  );
}

export function useDeleteWishlistOwnerMutation() {
  const trpc = useTRPC();

  return useMutation(
    trpc.wishlists.owned.owners.delete.mutationOptions({
      onMutate: async (input, context) => {
        await context.client.cancelQueries({
          queryKey: trpc.wishlists.owned.owners.getAll.queryKey({
            wishlistId: input.wishlistId,
          }),
        });

        const previous = context.client.getQueryData(
          trpc.wishlists.owned.owners.getAll.queryKey({
            wishlistId: input.wishlistId,
          }),
        );

        context.client.setQueryData(
          trpc.wishlists.owned.owners.getAll.queryKey({
            wishlistId: input.wishlistId,
          }),
          (old) =>
            old && {
              owners: old.owners.filter((owner) => owner.email !== input.email),
            },
        );

        return { previous };
      },
      onError: (err, input, onMutateResult, context) => {
        if (!onMutateResult) return;
        context.client.setQueryData(
          trpc.wishlists.owned.owners.getAll.queryKey({
            wishlistId: input.wishlistId,
          }),
          onMutateResult.previous,
        );
      },
      onSettled: (response, error, input, onMutateResult, context) => {
        void context.client.invalidateQueries({
          queryKey: trpc.wishlists.owned.owners.getAll.queryKey({
            wishlistId: input.wishlistId,
          }),
        });
      },
    }),
  );
}
