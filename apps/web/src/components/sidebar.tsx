import type { LinkProps } from "@tanstack/react-router";
import type React from "react";

import { useRouterState } from "@tanstack/react-router";
import {
  ChevronLeftIcon,
  ListCheckIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  Share2Icon,
  SunIcon,
} from "lucide-react";
import { useState } from "react";

import { useLoggedInAuth } from "~/hooks/route-context";
import { useIsClient } from "~/hooks/use-is-client";
import { useSignout } from "~/lib/auth";
import { cn } from "~/lib/utils";

import { Logo } from "./logo";
import { useTheme } from "./theme/context";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button, LinkButton } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTrigger,
} from "./ui/sheet";

interface NavLinkProps {
  to: LinkProps["to"];
  label: string;
  icon: React.ComponentType;
}

const mainLinks: NavLinkProps[] = [
  {
    to: "/app/wishlists",
    label: "My wishlists",
    icon: ListCheckIcon,
  },
  {
    to: "/app/shared",
    label: "Shared with me",
    icon: Share2Icon,
  },
];

export function isMainLinkPath(path?: string) {
  if (!path) return false;
  const trimmedPath = path.replace(/\/+$/, "");
  return mainLinks.some((link) => link.to === trimmedPath);
}

function ThemeSwitcher() {
  const theme = useTheme();
  const isClient = useIsClient();

  return (
    <>
      {(!isClient || theme.resolvedTheme === "light") && (
        <Button
          variant="ghost"
          className="w-full justify-start dark:hidden"
          onClick={() => theme.setTheme("dark")}
        >
          <MoonIcon />
          <span>Dark mode</span>
        </Button>
      )}
      {(!isClient || theme.resolvedTheme === "dark") && (
        <Button
          variant="ghost"
          className="hidden w-full justify-start dark:inline-flex"
          onClick={() => theme.setTheme("light")}
        >
          <SunIcon />
          <span>Light mode</span>
        </Button>
      )}
    </>
  );
}

function ProfileAvatar({ imgSrc, label }: { imgSrc?: string; label: string }) {
  return (
    <Avatar className="rounded-lg">
      {imgSrc ? (
        <AvatarImage src={imgSrc} alt={label} />
      ) : (
        <AvatarFallback className="rounded-lg uppercase">{label.slice(0, 2)}</AvatarFallback>
      )}
    </Avatar>
  );
}

export function SidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-col gap-1">
      {mainLinks.map((link) => (
        <LinkButton
          key={link.to}
          to={link.to}
          onClick={onNavigate}
          variant="ghost"
          className="justify-start data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
        >
          <link.icon />
          <span>{link.label}</span>
        </LinkButton>
      ))}
    </div>
  );
}

export function SidebarFooter() {
  const auth = useLoggedInAuth();
  const signout = useSignout();

  return (
    <div className="flex flex-col gap-4">
      <ThemeSwitcher />
      <Separator />
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-1 font-medium">
          <ProfileAvatar label={auth.user.name} imgSrc={auth.user.image ?? undefined} />
          <span>{auth.user.name}</span>
        </div>
        <Button onClick={() => signout.mutate()} variant="ghost" className="justify-start">
          <LogOutIcon />
          <span>Log out</span>
        </Button>
      </div>
    </div>
  );
}

export function DesktopNav({ className, ...props }: React.ComponentProps<"aside">) {
  const routerState = useRouterState();
  const fullPath = routerState.matches.at(-1)?.fullPath;
  const isMainPath = isMainLinkPath(fullPath);

  return (
    <aside
      className={cn(
        "hidden h-[100svh] w-64.25 shrink-0 border-r border-border px-2 py-4 md:flex md:flex-col",
        className,
      )}
      {...props}
    >
      <div className="px-2 pb-4">
        {isMainPath ? (
          <div className="flex h-8 flex-col justify-center">
            <Logo withName size="md" />
          </div>
        ) : (
          <LinkButton variant="ghost" to=".." className="justify-start">
            <ChevronLeftIcon />
            <span>Back</span>
          </LinkButton>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <SidebarLinks />
      </div>
      <div className="px-2 pb-2">
        <SidebarFooter />
      </div>
    </aside>
  );
}

export function MobileNav({ className, ...props }: React.ComponentProps<"div">) {
  const [open, setOpen] = useState(false);
  const closeNav = () => setOpen(false);
  const routerState = useRouterState();
  const fullPath = routerState.matches.at(-1)?.fullPath;
  const isMainPath = isMainLinkPath(fullPath);

  return (
    <div
      className={cn(
        "flex h-14 w-full shrink-0 items-center border-b border-border px-4 md:hidden",
        className,
      )}
      {...props}
    >
      {isMainPath ? (
        <Logo withName size="md" />
      ) : (
        <LinkButton variant="ghost" to="..">
          <ChevronLeftIcon />
          <span>Back</span>
        </LinkButton>
      )}
      <div className="grow" />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button size="icon" variant="ghost" className="hover:bg-accent dark:hover:bg-accent" />
          }
        >
          <MenuIcon />
        </SheetTrigger>
        <SheetPopup side="right" className="w-64.25 px-2" showCloseButton={false}>
          <SheetHeader className="items-center">
            <Logo withName onClick={closeNav} />
            <SheetDescription className="sr-only">Navigation menu</SheetDescription>
          </SheetHeader>
          <SheetPanel className="p-2">
            <SidebarLinks onNavigate={closeNav} />
          </SheetPanel>
          <SheetFooter className="flex-col items-stretch gap-4 px-2 sm:flex-col">
            <SidebarFooter />
          </SheetFooter>
        </SheetPopup>
      </Sheet>
    </div>
  );
}
