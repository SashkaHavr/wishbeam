import { cn } from "cn";
import type React from "react";

import { DesktopNav, MobileNav } from "./sidebar";

export function AppNav({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex h-[100svh] flex-col md:flex-row", className)} {...props}>
      <MobileNav />
      <DesktopNav />
      <main id="main-scrollable-area" className="grow overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
