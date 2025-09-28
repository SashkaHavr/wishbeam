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
              queryKey: trpc.wishlist.getOwned.queryKey(),
            });
            break;
          case 'wishlist-data':
            void queryClient.invalidateQueries({
              queryKey: trpc.wishlist.getById.queryKey({ id: data.wishlistId }),
            });
            break;
        }
      },
    }),
  );
}
