import { useQueryClient } from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';

import { useTRPC } from '~/lib/trpc';

export function useCacheInvalidation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  useSubscription(
    trpc.cache.invalidations.subscriptionOptions(void 0, {
      onData: (data) => {
        switch (data.type) {
          case 'wishlists':
            void queryClient.invalidateQueries({
              queryKey: trpc.wishlists.pathKey(),
            });
            break;
          case 'locks':
            void queryClient.invalidateQueries({
              queryKey: trpc.wishlists.shared.pathKey(),
            });
            break;
        }
      },
    }),
  );
}

export function usePublicWishlistCacheInvalidation(wishlistId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  useSubscription(
    trpc.cache.invalidationsPublic.subscriptionOptions(
      { wishlistId },
      {
        onData: (data) => {
          switch (data.type) {
            case 'locks':
              void queryClient.invalidateQueries({
                queryKey: trpc.wishlists.public.items.getAll.queryKey({
                  wishlistId: data.wishlistId,
                }),
              });
              break;
          }
        },
      },
    ),
  );
}
