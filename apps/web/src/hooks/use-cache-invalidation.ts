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
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          case 'wishlists':
            void queryClient.invalidateQueries({
              queryKey: trpc.ownedWishlist.pathKey(),
            });
            break;
        }
      },
    }),
  );
}
