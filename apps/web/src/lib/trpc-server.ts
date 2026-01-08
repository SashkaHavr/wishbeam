import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { createTrpcCaller } from "@wishbeam/trpc";

export const trpcServerFnMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  return await next({
    context: {
      trpc: createTrpcCaller({ request: getRequest() }),
    },
  });
});

export const getGeneralConfigServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .handler(async ({ context: { trpc } }) => {
    return await trpc.config.general();
  });

export const getHealthCheckServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .handler(async ({ context: { trpc } }) => {
    return await trpc.health();
  });
