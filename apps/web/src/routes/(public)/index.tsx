import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/")({
  beforeLoad: ({ context }) => {
    throw redirect({ to: context.session.loggedIn ? "/app" : "/login" });
  },
});
