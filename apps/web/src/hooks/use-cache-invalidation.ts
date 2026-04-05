import { skipToken, useQueryClient } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { useSubscription } from "@trpc/tanstack-react-query";

import { useTRPC } from "~/lib/trpc";

export function useCacheInvalidation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const auth = useRouteContext({ from: "__root__", select: (s) => s.auth });
  useSubscription(
    trpc.cache.invalidations.subscriptionOptions(auth.loggedIn ? void 0 : skipToken, {
      onData: (data) => {
        switch (data.type) {
          case "wishlists":
            void queryClient.invalidateQueries({
              queryKey: trpc.wishlists.pathKey(),
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
            case "wishlists":
              void queryClient.invalidateQueries({
                queryKey: trpc.wishlists.pathKey(),
              });
              break;
          }
        },
      },
    ),
  );
}
