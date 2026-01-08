import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import type { TRPCInput } from "@wishbeam/trpc";

import { trpcServerFnMiddleware } from "~/lib/trpc-server";

export const wishlistOwnedGetByIdServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .inputValidator((data: TRPCInput["wishlists"]["owned"]["getById"]) => data)
  .handler(async ({ context, data }) => {
    try {
      return await context.trpc.wishlists.owned.getById(data);
    } catch {
      throw notFound();
    }
  });

export const wishlistOwnedGetItemsServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .inputValidator((data: TRPCInput["wishlists"]["owned"]["items"]["getAll"]) => data)
  .handler(async ({ context, data }) => {
    try {
      return await context.trpc.wishlists.owned.items.getAll(data);
    } catch {
      throw notFound();
    }
  });

export const wishlistPublicGetByIdServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .inputValidator((data: TRPCInput["wishlists"]["public"]["getById"]) => data)
  .handler(async ({ context, data }) => {
    try {
      return await context.trpc.wishlists.public.getById(data);
    } catch {
      throw notFound();
    }
  });

export const wishlistPublicGetItemsServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .inputValidator((data: TRPCInput["wishlists"]["public"]["items"]["getAll"]) => data)
  .handler(async ({ context, data }) => {
    try {
      return await context.trpc.wishlists.public.items.getAll(data);
    } catch {
      throw notFound();
    }
  });

export const wishlistSharedGetByIdServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .inputValidator((data: TRPCInput["wishlists"]["shared"]["getById"]) => data)
  .handler(async ({ context, data }) => {
    try {
      return await context.trpc.wishlists.shared.getById(data);
    } catch {
      throw notFound();
    }
  });

export const wishlistSharedGetItemsServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .inputValidator((data: TRPCInput["wishlists"]["shared"]["items"]["getAll"]) => data)
  .handler(async ({ context, data }) => {
    try {
      return await context.trpc.wishlists.shared.items.getAll(data);
    } catch {
      throw notFound();
    }
  });

export const wishlistsSharedGetAllServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .handler(async ({ context }) => {
    return await context.trpc.wishlists.shared.getAll();
  });

export const wishlistsOwnedGetAllServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .handler(async ({ context }) => {
    return await context.trpc.wishlists.owned.getAll();
  });
