import { initTRPC, TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import superjson from "superjson";
import z, { ZodError } from "zod";

import type { Context } from "#context.ts";

import { base62ToUuidv7 } from "#utils/zod-utils.ts";
import { auth } from "@wishbeam/auth";
import { db } from "@wishbeam/db";
import { getActiveSpan, SpanStatusCode, startActiveSpan } from "@wishbeam/otel";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? z.prettifyError(error.cause) : null,
      },
    };
  },
});

export const router = t.router;

export const publicProcedure = t.procedure.use(async ({ next, path, type, ctx: { request } }) => {
  return await startActiveSpan(path, async (span) => {
    const url = new URL(request.url);
    span.setAttributes({
      "http.request.method": request.method,
      "url.path": url.pathname,
      "url.query": decodeURIComponent(url.search),
      "trpc.type": type,
      "trpc.path": path,
    });

    const result = await next();

    if (result.ok) {
      span.setAttributes({
        "http.response.status_code": 200,
      });
      span.setStatus({ code: SpanStatusCode.OK });
    } else {
      span.setAttributes({
        "http.response.status_code": getHTTPStatusCodeFromError(result.error),
        "trpc.error_code": result.error.code,
      });
      span.recordException(result.error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: result.error.message });

      if (result.error.cause instanceof ZodError) {
        span.recordException(z.prettifyError(result.error.cause));
      } else if (result.error.cause !== undefined) {
        span.recordException(result.error.cause);
      }
    }

    return result;
  });
});

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const span = getActiveSpan();

  const session = await auth.api.getSession({
    headers: ctx.request.headers,
  });
  if (!session) {
    throw new TRPCError({
      message: "You must authenticate to use this endpoint",
      code: "UNAUTHORIZED",
    });
  }

  span?.setAttributes({
    "user.id": session.user.id,
    "user.email": session.user.email,
    "user.role": session.user.role ?? undefined,
  });

  return await next({
    ctx: {
      ...ctx,
      session: session,
      userId: session.user.id,
    },
  });
});

export function adminProcedure(
  permissions: NonNullable<
    NonNullable<Parameters<typeof auth.api.userHasPermission>[0]>["body"]["permissions"]
  >,
) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const span = getActiveSpan();

    const requestPermissionsList = (
      Object.entries(permissions) as [
        keyof typeof permissions,
        NonNullable<(typeof permissions)[keyof typeof permissions]>,
      ][]
    )
      .flatMap(([key, value]) =>
        value.map((p): `${keyof typeof permissions}.${typeof p}` => `${key}.${p}`),
      )
      .flat();
    if (requestPermissionsList.length === 0) {
      throw new TRPCError({
        message: "No permissions specified for adminProcedure",
        code: "INTERNAL_SERVER_ERROR",
      });
    }

    const hasPermission = await auth.api.userHasPermission({
      body: { userId: ctx.userId, permissions: permissions },
    });
    if (!hasPermission.success) {
      throw new TRPCError({
        message: "You don't have permissions to access this endpoint",
        code: "FORBIDDEN",
      });
    }

    span?.setAttributes({
      "trpc.permissions": requestPermissionsList,
    });

    return await next();
  });
}

export const ownedWishlistProcedure = protectedProcedure
  .input(z.object({ wishlistId: base62ToUuidv7 }))
  .use(async ({ input, ctx, next }) => {
    const wishlist = await db.query.wishlist.findFirst({
      where: { id: input.wishlistId, wishlistOwners: { userId: ctx.userId } },
      with: { wishlistOwners: true },
    });
    const currentOwner = wishlist?.wishlistOwners.find((wo) => wo.userId === ctx.userId);
    if (!wishlist || !currentOwner) {
      throw new TRPCError({
        message: "Wishlist not found",
        code: "NOT_FOUND",
      });
    }
    return await next({
      ctx: {
        ...ctx,
        wishlist,
        currentOwner,
      },
    });
  });

export const sharedWishlistProcedure = protectedProcedure
  .input(z.object({ wishlistId: base62ToUuidv7 }))
  .use(async ({ input, ctx, next }) => {
    const wishlist = await db.query.wishlist.findFirst({
      where: {
        id: input.wishlistId,
        OR: [
          { shareStatus: "public" },
          { shareStatus: "shared", wishlistSharedWith: { userId: ctx.userId } },
        ],
      },
      with: { wishlistOwners: true },
    });
    if (!wishlist) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Wishlist not found",
      });
    }
    if (wishlist.wishlistOwners.some((wo) => wo.userId === ctx.userId)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Owners cannot access shared wishlist endpoints",
      });
    }
    return await next({
      ctx: {
        ...ctx,
        wishlist,
      },
    });
  });

export const createCallerFactory = t.createCallerFactory;
