import { createFileRoute } from "@tanstack/react-router";

import { LoginCard } from "~/components/login";
import { Logo } from "~/components/logo";

export const Route = createFileRoute("/(public)/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Logo className="flex items-center gap-2 self-center font-medium" withName />
        <LoginCard />
      </div>
    </div>
  );
}
