import type { LinkProps } from "@tanstack/react-router";
import type React from "react";

import { Link, useRouterState } from "@tanstack/react-router";
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
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetTitle,
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

function NavTab({ to, label, icon: IconProp }: NavLinkProps) {
  return (
    <Link
      to={to}
      className="group/tab relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground data-[status=active]:text-accent-foreground"
    >
      <IconProp />
      <span>{label}</span>
      <span className="absolute inset-x-1 -bottom-[9px] h-0.5 scale-x-0 rounded-full bg-primary transition-transform group-data-[status=active]/tab:scale-x-100" />
    </Link>
  );
}

function ThemeSwitcher() {
  const theme = useTheme();
  const isClient = useIsClient();

  return (
    <>
      {(!isClient || theme.resolvedTheme === "light") && (
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent hover:text-accent-foreground dark:hidden"
          onClick={() => theme.setTheme("dark")}
        >
          <MoonIcon />
        </Button>
      )}
      {(!isClient || theme.resolvedTheme === "dark") && (
        <Button
          variant="ghost"
          size="icon"
          className="hidden hover:bg-accent hover:text-accent-foreground dark:inline-flex"
          onClick={() => theme.setTheme("light")}
        >
          <SunIcon />
        </Button>
      )}
    </>
  );
}

function MobileThemeSwitcher() {
  const theme = useTheme();
  const isClient = useIsClient();

  return (
    <>
      {(!isClient || theme.resolvedTheme === "light") && (
        <Button
          variant="ghost"
          className="justify-start text-muted-foreground dark:hidden"
          onClick={() => theme.setTheme("dark")}
        >
          <MoonIcon />
          <span>Dark mode</span>
        </Button>
      )}
      {(!isClient || theme.resolvedTheme === "dark") && (
        <Button
          variant="ghost"
          className="hidden justify-start text-muted-foreground dark:inline-flex"
          onClick={() => theme.setTheme("light")}
        >
          <SunIcon />
          <span>Light mode</span>
        </Button>
      )}
    </>
  );
}

function MobileProfileButton({ onLinkClick }: { onLinkClick?: () => void }) {
  const signout = useSignout();
  const auth = useLoggedInAuth();

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" className="justify-start" />}>
        <ProfileAvatar label={auth.user.name} imgSrc={auth.user.image ?? undefined} />
        <span>{auth.user.name}</span>
      </PopoverTrigger>
      <PopoverContent
        side="left"
        align="start"
        className="w-48 p-0 [&_[data-slot=popover-viewport]]:px-1 [&_[data-slot=popover-viewport]]:py-2"
      >
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => {
            signout.mutate();
            onLinkClick?.();
          }}
        >
          <LogOutIcon />
          <span>Log out</span>
        </Button>
      </PopoverContent>
    </Popover>
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

function ProfileButtonWithPopover({ onLinkClick }: { onLinkClick?: () => void }) {
  const signout = useSignout();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const auth = useLoggedInAuth();

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="hover:bg-accent dark:hover:bg-accent" />
        }
      >
        <ProfileAvatar label={auth.user.name} imgSrc={auth.user.image ?? undefined} />
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="w-48 p-0 [&_[data-slot=popover-viewport]]:px-1 [&_[data-slot=popover-viewport]]:py-1"
      >
        <div className="flex items-center gap-2 px-2 py-2 text-left text-sm leading-tight">
          <ProfileAvatar label={auth.user.name} imgSrc={auth.user.image ?? undefined} />
          <span className="truncate font-medium">{auth.user.name}</span>
        </div>
        <Separator className="mx-1" />
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            signout.mutate();
            onLinkClick?.();
          }}
        >
          <LogOutIcon />
          <span>Log out</span>
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export function TopNav({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      className={cn(
        "hidden h-14 w-full shrink-0 items-center gap-1 border-b border-border px-4 md:flex",
        className,
      )}
      {...props}
    >
      <Logo withName size="md" className="mr-6" />
      <div className="flex items-center gap-1">
        {mainLinks.map((link) => (
          <NavTab key={link.to} {...link} />
        ))}
      </div>
      <div className="grow" />
      <div className="flex items-center gap-1">
        <ThemeSwitcher />
        <ProfileButtonWithPopover />
      </div>
    </nav>
  );
}

export function MobileNav({ className, ...props }: React.ComponentProps<"div">) {
  const [open, setOpen] = useState(false);
  const closeNav = () => setOpen(false);
  const routerState = useRouterState();
  const fullPath = routerState.matches.at(-1)?.fullPath;
  const exactMatch = mainLinks.find((link) => {
    if (!fullPath) return false;
    const trimmedPath = fullPath.replace(/\/+$/, "");
    return link.to === trimmedPath;
  });

  return (
    <div
      className={cn(
        "flex h-14 w-full shrink-0 items-center border-b border-border px-4 md:hidden",
        className,
      )}
      {...props}
    >
      {exactMatch ? (
        <Logo withName size="md" />
      ) : (
        <Button variant="ghost" nativeButton={false} render={<Link to={".."} />}>
          <ChevronLeftIcon />
          <span>Back</span>
        </Button>
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
        <SheetContent side="right" className="w-64.25 px-2">
          <SheetHeader>
            <SheetTitle>
              <Logo withName onClick={closeNav} />
            </SheetTitle>
            <SheetDescription className="sr-only">Navigation menu</SheetDescription>
          </SheetHeader>
          <SheetPanel className="p-2">
            <div className="flex flex-col gap-1">
              {mainLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeNav}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
                >
                  <link.icon />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </SheetPanel>
          <SheetFooter className="flex-col items-stretch gap-4 px-2">
            <MobileThemeSwitcher />
            <MobileProfileButton onLinkClick={closeNav} />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
