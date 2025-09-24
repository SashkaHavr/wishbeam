import type React from 'react';
import type { NavLinkProps } from 'utils/nav-links';
import { useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Link, useMatchRoute } from '@tanstack/react-router';
import {
  EllipsisVerticalIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SunIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { navLinks } from 'utils/nav-links';

import { useIsClient } from '~/hooks/use-is-client';
import { useSignout } from '~/lib/auth';
import { cn } from '~/lib/utils';
import { Logo } from './logo';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { Skeleton } from './ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

function ProfileElements({ open = true }: { open?: boolean }) {
  return (
    <>
      <Avatar className="items-center justify-center transition-none">
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      {open && <span className="truncate font-medium">Profile</span>}
    </>
  );
}

function SidebarLink({
  icon: IconProp,
  ...props
}: Omit<React.ComponentProps<typeof SidebarButton>, 'children'> &
  NavLinkProps & { open?: boolean }) {
  return (
    <SidebarAdaptiveButton
      className="data-[status=active]:bg-sidebar-primary data-[status=active]:text-sidebar-primary-foreground data-[status=active]:hover:bg-sidebar-primary/90 data-[status=active]:dark:hover:bg-sidebar-primary/50"
      icon={<IconProp />}
      {...props}
    >
      <Link to={props.to}>
        <SidebarAdaptiveButtonContent
          open={props.open}
          label={props.label}
          icon={<IconProp />}
        />
      </Link>
    </SidebarAdaptiveButton>
  );
}

function SidebarAdaptiveButtonContent({
  open = true,
  label,
  icon,
}: {
  open?: boolean;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <>
      {icon}
      {open && <span>{label}</span>}
    </>
  );
}

function SidebarAdaptiveButton({
  className,
  open = true,
  size,
  label,
  icon,
  children,
  ...props
}: React.ComponentProps<typeof SidebarButton> &
  React.ComponentProps<typeof SidebarAdaptiveButtonContent>) {
  const button = (
    <SidebarButton
      asChild={children !== undefined}
      className={cn(open && 'justify-start', className)}
      size={open ? size : 'icon'}
      {...props}
    >
      {children ?? (
        <SidebarAdaptiveButtonContent open={open} label={label} icon={icon} />
      )}
    </SidebarButton>
  );

  return open ? (
    button
  ) : (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right">
        <span>{label}</span>
      </TooltipContent>
    </Tooltip>
  );
}

function SidebarButton({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'variant'>) {
  return (
    <Button
      variant="ghost"
      className={cn(
        'transition-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:border-sidebar-ring has-[>svg]:px-2 dark:hover:bg-sidebar-accent/50',
        className,
      )}
      {...props}
    ></Button>
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col p-2', className)} {...props}></div>;
}

function SidebarHeader({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <SidebarGroup className={cn(open ? 'flex-row' : 'gap-1')}>
      <Logo withName={open} className="p-0.5" />
      {onOpenChange && (
        <>
          <div className="grow" />
          <SidebarButton size="icon" onClick={() => onOpenChange(!open)}>
            <div className="grid grid-cols-1 grid-rows-1">
              <PanelLeftCloseIcon
                className={cn(
                  'col-end-1 row-end-1 self-center justify-self-end transition-opacity',
                  open ? 'opacity-100' : 'opacity-0',
                )}
              />
              <PanelLeftOpenIcon
                className={cn(
                  'col-end-1 row-end-1 self-center justify-self-end transition-opacity',
                  open ? 'opacity-0' : 'opacity-100',
                )}
              />
            </div>
          </SidebarButton>
        </>
      )}
    </SidebarGroup>
  );
}

function ThemeSwitcher({ desktopOpen }: { desktopOpen: boolean }) {
  const theme = useTheme();
  const isClient = useIsClient();

  return isClient ? (
    <SidebarAdaptiveButton
      open={desktopOpen}
      label={theme.resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
      icon={theme.resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
      onClick={() =>
        theme.setTheme(theme.resolvedTheme === 'light' ? 'dark' : 'light')
      }
      size={desktopOpen ? 'lg' : 'icon'}
    />
  ) : (
    <Skeleton className="size-9" />
  );
}

export function Sidebar({
  className,
  open = true,
  onOpenChange,
  ...props
}: React.ComponentProps<'div'> & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const signout = useSignout();

  return (
    <div
      className={cn(
        'hidden h-full flex-col bg-sidebar p-2 text-sidebar-foreground transition-all md:flex',
        open ? 'w-64' : 'w-17',
        className,
      )}
      {...props}
    >
      <SidebarHeader open={open} onOpenChange={onOpenChange} />
      <SidebarGroup>
        {navLinks.main.map((link) => (
          <SidebarLink key={link.to} {...link} open={open} />
        ))}
      </SidebarGroup>
      <div className="grow" />
      <SidebarGroup>
        {navLinks.bottom.map((link) => (
          <SidebarLink key={link.to} {...link} open={open} />
        ))}
        <ThemeSwitcher desktopOpen={open} />
      </SidebarGroup>
      <SidebarGroup>
        <Popover>
          <PopoverTrigger asChild>
            <SidebarButton
              className={cn(
                'items-center font-normal',
                open && 'justify-start',
              )}
              size={open ? 'lg' : 'icon'}
            >
              <ProfileElements open={open} />
              {open && (
                <>
                  <div className="grow" />
                  <EllipsisVerticalIcon />
                </>
              )}
            </SidebarButton>
          </PopoverTrigger>
          <PopoverContent side="right" className="p-1">
            <div className="flex items-center gap-1 px-1 py-1.5 text-sm leading-tight">
              <ProfileElements />
            </div>
            <Separator className="m-1" />
            <div>
              {navLinks.profileMenu.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to={item.to}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
            <Separator className="m-1" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => signout.mutate()}
            >
              <LogOutIcon />
              <span>Log out</span>
            </Button>
          </PopoverContent>
        </Popover>
      </SidebarGroup>
    </div>
  );
}

export function MobileNav({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [open, setOpen] = useState(false);
  const matchRoute = useMatchRoute();
  const matchedLink = [
    ...navLinks.main,
    ...navLinks.bottom,
    ...navLinks.profileMenu,
  ]
    .filter((link) => matchRoute({ to: link.to }))
    .pop();
  const signout = useSignout();

  return (
    <div
      className={cn('flex w-full items-center p-2.5 md:hidden', className)}
      {...props}
    >
      {matchedLink && (
        <span className="text-lg font-medium">{matchedLink.label}</span>
      )}
      <div className="grow" />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost">
            <MenuIcon />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64">
          <SheetHeader>
            <SheetTitle>
              <Logo withName />
            </SheetTitle>
            <VisuallyHidden>
              <SheetDescription>Navigation menu</SheetDescription>
            </VisuallyHidden>
          </SheetHeader>
          <div className="flex flex-col gap-1 px-2">
            {navLinks.main.map((link) => (
              <SidebarLink key={link.to} {...link} />
            ))}
          </div>
          <SheetFooter className="p-0 px-2 py-4">
            <div className="flex flex-col gap-1">
              {navLinks.bottom.map((link) => (
                <SidebarLink key={link.to} {...link} />
              ))}
              <ThemeSwitcher desktopOpen={true} />
              <Separator />
              {navLinks.profileMenu.map((link) => (
                <SidebarLink key={link.to} {...link} />
              ))}
              <SidebarButton
                className="justify-start"
                onClick={() => signout.mutate()}
              >
                <LogOutIcon />
                <span>Log out</span>
              </SidebarButton>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
