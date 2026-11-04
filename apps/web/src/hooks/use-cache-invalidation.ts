import { useQueryClient } from "@tanstack/react-query";
import { Effect, Schedule, Stream } from "effect";
import { useEffect } from "react";

import type { IdBranded } from "@wishbeam/db/id-branded";
import { getApiClient } from "~/lib/api";
import { wishlistQueryKey } from "~/queries/wishlists";

export function useCacheInvalidation(publicWishlistId?: IdBranded<"wishlist">) {
  const queryClient = useQueryClient();
  useEffect(() => {
    const controller = new AbortController();
    const stream = Stream.unwrap(
      Effect.gen(function* () {
        if (publicWishlistId) {
          return yield* getApiClient().publicEvents.subscribe({ params: { id: publicWishlistId } });
        }
        return yield* getApiClient().events.subscribe();
      }),
    );
    const subscription = stream.pipe(
      Stream.runForEach(() =>
        Effect.promise(async () => {
          await queryClient.invalidateQueries({
            queryKey: publicWishlistId
              ? wishlistQueryKey.byId(publicWishlistId)
              : wishlistQueryKey.all(),
          });
        }),
      ),
      Effect.retry(Schedule.spaced("2 seconds")),
    );
    void Effect.runPromise(subscription, { signal: controller.signal }).catch(() => {
      // Aborting the subscription on navigation is expected.
    });
    return () => controller.abort();
  }, [queryClient, publicWishlistId]);
}
