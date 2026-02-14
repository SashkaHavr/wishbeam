import type React from "react";

import { useDesktop, useMobile } from "~/hooks/use-breakpoint";
import { cn } from "~/lib/utils";

import { MobileNav, TopNav } from "./sidebar";

export function AppNav({ className, children, ...props }: React.ComponentProps<"div">) {
  const mobile = useMobile();
  const desktop = useDesktop();
  return (
    <div className={cn("flex h-[100svh] flex-col", className)} {...props}>
      {desktop && <TopNav />}
      {mobile && <MobileNav />}
      <main className="grow overflow-y-auto">{children}</main>
    </div>
  );
}
