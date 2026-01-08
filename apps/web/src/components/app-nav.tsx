import type React from "react";

import { useDesktop, useMobile } from "~/hooks/use-breakpoint";
import { cn } from "~/lib/utils";

import { MobileNav, Sidebar } from "./sidebar";
import { Separator } from "./ui/separator";

export function AppNav({
  className,
  children,
  desktopSidebarOpen,
  onDesktopSidebarOpenChange,
  ...props
}: React.ComponentProps<"div"> & {
  desktopSidebarOpen: boolean;
  onDesktopSidebarOpenChange: (open: boolean) => void;
}) {
  const mobile = useMobile();
  const desktop = useDesktop();
  return (
    <div className={cn("flex h-[100svh] flex-col md:flex-row", className)} {...props}>
      {desktop && (
        <>
          <Sidebar open={desktopSidebarOpen} onOpenChange={onDesktopSidebarOpenChange} />
          <Separator orientation="vertical" className="hidden md:block" />
        </>
      )}
      {mobile && (
        <>
          <MobileNav />
          <Separator orientation="horizontal" className="md:hidden" />
        </>
      )}
      <main className="grow overflow-y-auto">{children}</main>
    </div>
  );
}
