import { trpcHandler } from "@wishbeam/trpc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/trpc/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return trpcHandler({ request });
      },
      POST: async ({ request }) => {
        return trpcHandler({ request });
      },
    },
  },
});
