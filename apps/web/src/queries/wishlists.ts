import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { Effect } from "effect";
import type { Schema } from "effect";
import type { HttpClientError } from "effect/http";

import type { ApiClient, ApiErrors, ApiInput } from "@wishbeam/api-contract";
import type { IdBranded } from "@wishbeam/db/id-branded";
import { m } from "@wishbeam/intl/messages";
import { toastManager } from "~/components/ui/toast";
import { getApiClient } from "~/lib/api";

type Input = ApiInput["wishlists"];
type Items = ApiInput["wishlistItems"];
type WishlistId = IdBranded<"wishlist">;

export const wishlistQueryKey = {
  all: () => ["wishlists"] as const,
  owned: () => ["wishlists", "owned"] as const,
  shared: () => ["wishlists", "shared"] as const,
  byId: (id: WishlistId) => ["wishlists", id] as const,
};
export const allWishlistsQueryOptions = queryOptions({
  queryKey: wishlistQueryKey.owned(),
  queryFn: async ({ signal }) => Effect.runPromise(getApiClient().wishlists.getAll(), { signal }),
});
export const sharedWishlistsQueryOptions = queryOptions({
  queryKey: wishlistQueryKey.shared(),
  queryFn: async ({ signal }) =>
    Effect.runPromise(getApiClient().wishlists.getShared(), { signal }),
});
export function isOwnedQueryOptions(id: WishlistId) {
  return queryOptions({
    queryKey: [...wishlistQueryKey.byId(id), "isOwned"],
    queryFn: async ({ signal }) =>
      Effect.runPromise(getApiClient().wishlists.isOwned({ params: { id } }), { signal }),
  });
}
export function wishlistQueryOptions(id: WishlistId) {
  return queryOptions({
    queryKey: [...wishlistQueryKey.byId(id), "owned"],
    queryFn: async ({ signal }) =>
      Effect.runPromise(getApiClient().wishlists.get({ params: { id } }), { signal }),
  });
}
export function sharedWishlistQueryOptions(id: WishlistId) {
  return queryOptions({
    queryKey: [...wishlistQueryKey.byId(id), "shared"],
    queryFn: async ({ signal }) =>
      Effect.runPromise(getApiClient().wishlists.getSharedById({ params: { id } }), {
        signal,
      }),
  });
}
export function publicWishlistQueryOptions(id: WishlistId) {
  return queryOptions({
    queryKey: [...wishlistQueryKey.byId(id), "public"],
    queryFn: async ({ signal }) =>
      Effect.runPromise(getApiClient().publicWishlists.get({ params: { id } }), { signal }),
  });
}
export function wishlistItemsQueryOptions(id: WishlistId) {
  return queryOptions({
    queryKey: [...wishlistQueryKey.byId(id), "items", "owned"],
    queryFn: async ({ signal }) =>
      Effect.runPromise(getApiClient().wishlistItems.getAll({ params: { id } }), {
        signal,
      }),
  });
}
export function sharedWishlistItemsQueryOptions(id: WishlistId) {
  return queryOptions({
    queryKey: [...wishlistQueryKey.byId(id), "items", "shared"],
    queryFn: async ({ signal }) =>
      Effect.runPromise(getApiClient().wishlistItems.getShared({ params: { id } }), {
        signal,
      }),
  });
}
export function publicWishlistItemsQueryOptions(id: WishlistId) {
  return queryOptions({
    queryKey: [...wishlistQueryKey.byId(id), "items", "public"],
    queryFn: async ({ signal }) =>
      Effect.runPromise(getApiClient().publicWishlistItems.getAll({ params: { id } }), {
        signal,
      }),
  });
}
export function wishlistOwnersQueryOptions(id: WishlistId) {
  return queryOptions({
    queryKey: [...wishlistQueryKey.byId(id), "owners"],
    queryFn: async ({ signal }) =>
      Effect.runPromise(getApiClient().wishlists.getOwners({ params: { id } }), { signal }),
  });
}
export function wishlistMembersQueryOptions(id: WishlistId) {
  return queryOptions({
    queryKey: [...wishlistQueryKey.byId(id), "members"],
    queryFn: async ({ signal }) =>
      Effect.runPromise(getApiClient().wishlists.getMembers({ params: { id } }), {
        signal,
      }),
  });
}

type MutationError =
  | ApiErrors["wishlists"][keyof ApiErrors["wishlists"]]
  | ApiErrors["wishlistItems"][keyof ApiErrors["wishlistItems"]]
  | HttpClientError.HttpClientError
  | Schema.SchemaError;

function useWishlistMutation<I, A>(
  run: (client: ApiClient, input: I) => Effect.Effect<A, MutationError>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: I) => Effect.runPromise(run(getApiClient(), input)),
    onError: (domainError: MutationError) => {
      toastManager.add({
        type: "error",
        title:
          domainError._tag === "WishlistMemberConflict"
            ? m.error_memberConflict()
            : domainError._tag === "WishlistUserNotFound"
              ? m.error_userNotFound()
              : domainError._tag === "WishlistItemLockConflict"
                ? m.error_lockConflict()
                : m.routeDefault_error(),
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: wishlistQueryKey.all() });
    },
  });
}
export function useCreateWishlist() {
  return useWishlistMutation((client, payload: Input["create"]["payload"]) =>
    client.wishlists.create({ payload }),
  );
}
export function useUpdateWishlist(id: WishlistId) {
  return useWishlistMutation((client, payload: Input["update"]["payload"]) =>
    client.wishlists.update({ params: { id }, payload }),
  );
}
export function useDeleteWishlist() {
  return useWishlistMutation((client, id: WishlistId) =>
    client.wishlists.delete({ params: { id } }),
  );
}
export function useSetShareStatus(id: WishlistId) {
  return useWishlistMutation((client, payload: Input["setShareStatus"]["payload"]) =>
    client.wishlists.setShareStatus({ params: { id }, payload }),
  );
}
export function useAddOwner(id: WishlistId) {
  return useWishlistMutation((client, payload: Input["addOwner"]["payload"]) =>
    client.wishlists.addOwner({ params: { id }, payload }),
  );
}
export function useDeleteOwner(id: WishlistId) {
  return useWishlistMutation((client, userId: IdBranded<"user">) =>
    client.wishlists.deleteOwner({ params: { id, userId } }),
  );
}
export function useAddMember(id: WishlistId) {
  return useWishlistMutation((client, payload: Input["addMember"]["payload"]) =>
    client.wishlists.addMember({ params: { id }, payload }),
  );
}
export function useDeleteMember(id: WishlistId) {
  return useWishlistMutation((client, userId: IdBranded<"user">) =>
    client.wishlists.deleteMember({ params: { id, userId } }),
  );
}
export function useCreateWishlistItem(id: WishlistId) {
  return useWishlistMutation((client, payload: Items["create"]["payload"]) =>
    client.wishlistItems.create({ params: { id }, payload }),
  );
}
export function useUpdateWishlistItem(id: WishlistId, itemId: IdBranded<"wishlist-item">) {
  return useWishlistMutation((client, payload: Items["update"]["payload"]) =>
    client.wishlistItems.update({ params: { id, itemId }, payload }),
  );
}
export function useDeleteWishlistItem(id: WishlistId) {
  return useWishlistMutation((client, itemId: IdBranded<"wishlist-item">) =>
    client.wishlistItems.delete({ params: { id, itemId } }),
  );
}
export function useSetItemStatus(id: WishlistId) {
  return useWishlistMutation(
    (
      client,
      input: {
        itemId: IdBranded<"wishlist-item">;
        status: Items["setStatus"]["payload"]["status"];
      },
    ) =>
      client.wishlistItems.setStatus({
        params: { id, itemId: input.itemId },
        payload: { status: input.status },
      }),
  );
}
export function useMoveWishlistItem(id: WishlistId) {
  return useWishlistMutation(
    (
      client,
      input: {
        itemId: IdBranded<"wishlist-item">;
        direction: Items["move"]["payload"]["direction"];
      },
    ) =>
      client.wishlistItems.move({
        params: { id, itemId: input.itemId },
        payload: { direction: input.direction },
      }),
  );
}
export function useLockWishlistItem(id: WishlistId) {
  return useWishlistMutation((client, itemId: IdBranded<"wishlist-item">) =>
    client.wishlistItems.lock({ params: { id, itemId } }),
  );
}
export function useUnlockWishlistItem(id: WishlistId) {
  return useWishlistMutation((client, itemId: IdBranded<"wishlist-item">) =>
    client.wishlistItems.unlock({ params: { id, itemId } }),
  );
}
