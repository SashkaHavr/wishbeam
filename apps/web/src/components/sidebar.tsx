import type React from 'react';
import { useEffect, useEffectEvent, useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  ChevronLeftIcon,
  EllipsisVerticalIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SunIcon,
} from 'lucide-react';

import type { NavLinkProps } from '~/utils/nav-links';
import { useNotMatchesBreakpoint } from '~/hooks/use-breakpoint';
import { useIsClient } from '~/hooks/use-is-client';
import { useSignout } from '~/lib/auth';
import { cn } from '~/lib/utils';
import { navLinks } from '~/utils/nav-links';
import { Logo } from './logo';
import { useTheme } from './theme/context';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
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
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

function useKeyboardShortcut({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'b' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      onOpenChange(!open);
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
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
  return (
    <div className={cn('flex flex-col gap-1 p-2', className)} {...props}></div>
  );
}

function SidebarHeader({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <SidebarGroup className={cn(open ? 'flex-row' : 'gap-1')}>
      <Logo withName={open} className="p-0.5" />
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
    </SidebarGroup>
  );
}

function ThemeSwitcher({ desktopOpen }: { desktopOpen: boolean }) {
  const theme = useTheme();
  const isClient = useIsClient();

  return (
    <>
      {(!isClient || theme.resolvedTheme === 'light') && (
        <SidebarAdaptiveButton
          className="dark:hidden"
          open={desktopOpen}
          label={'Dark mode'}
          icon={<MoonIcon />}
          onClick={() => theme.setTheme('dark')}
          size={desktopOpen ? undefined : 'icon'}
        />
      )}
      {(!isClient || theme.resolvedTheme === 'dark') && (
        <SidebarAdaptiveButton
          className="hidden dark:inline-flex"
          open={desktopOpen}
          label={'Light mode'}
          icon={<SunIcon />}
          onClick={() => theme.setTheme('light')}
          size={desktopOpen ? undefined : 'icon'}
        />
      )}
    </>
  );
}

function ProfileAvatar({ imgSrc, label }: { imgSrc?: string; label: string }) {
  return (
    <Avatar className="rounded-lg grayscale">
      {imgSrc ? (
        <AvatarImage src={imgSrc} alt={label} />
      ) : (
        <AvatarFallback className="rounded-lg uppercase">
          {label.slice(0, 2)}
        </AvatarFallback>
      )}
    </Avatar>
  );
}

function ProfileButton({
  open = true,
  label,
  endIcon,
  imgSrc,
  className,
  ...props
}: Omit<React.ComponentProps<typeof SidebarButton>, 'children' | 'size'> & {
  open?: boolean;
  label: string;
  endIcon?: React.ReactNode;
  imgSrc?: string;
}) {
  return (
    <SidebarButton
      className={cn(
        'h-12 items-center font-normal',
        open && 'justify-start p-2',
        className,
      )}
      size={open ? 'lg' : 'icon'}
      {...props}
    >
      <ProfileAvatar imgSrc={imgSrc} label={label} />
      {open && (
        <>
          <span className="truncate font-medium">{label}</span>
          <div className="grow" />
          {endIcon}
        </>
      )}
    </SidebarButton>
  );
}

function ProfileButtonWithPopover({
  open,
  onLinkClick,
}: {
  open?: boolean;
  onLinkClick?: () => void;
}) {
  const signout = useSignout();
  const mobile = useNotMatchesBreakpoint('md');
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <ProfileButton
          label="Profile"
          endIcon={<EllipsisVerticalIcon />}
          open={open}
        />
      </PopoverTrigger>
      <PopoverContent side={mobile ? 'top' : 'right'} className="p-1">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm leading-tight">
          <ProfileAvatar label="Profile" />
          {open && <span className="truncate font-medium">Profile</span>}
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
              <Link
                to={item.to}
                onClick={() => {
                  setPopoverOpen(false);
                  onLinkClick?.();
                }}
              >
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
  );
}

export function Sidebar({
  className,
  open = true,
  onOpenChange,
  ...props
}: React.ComponentProps<'div'> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  useKeyboardShortcut({ open, onOpenChange });

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
        <ProfileButtonWithPopover open={open} />
      </SidebarGroup>
    </div>
  );
}

export function MobileNav({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [open, setOpen] = useState(false);
  const closeNav = () => setOpen(false);
  const routerState = useRouterState();
  const allLinks = [
    ...navLinks.main,
    ...navLinks.bottom,
    ...navLinks.profileMenu,
  ];
  const fullPath =
    routerState.matches[routerState.matches.length - 1]?.fullPath;
  const exactMatch = allLinks.find((link) => {
    if (!fullPath) return false;
    const trimmedPath = fullPath.replace(/\/+$/, '');
    return link.to === trimmedPath;
  });

  return (
    <div
      className={cn(
        'flex w-full items-center px-4 py-2.5 md:hidden',
        className,
      )}
      {...props}
    >
      {exactMatch ? (
        <Button variant="ghost" asChild>
          <Link to={exactMatch.to}>{exactMatch.label}</Link>
        </Button>
      ) : (
        <Button variant="ghost" asChild>
          <Link to={'..'}>
            <ChevronLeftIcon />
            <span>Back</span>
          </Link>
        </Button>
      )}
      <div className="grow" />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost">
            <MenuIcon />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64.25 px-2">
          <SheetHeader>
            <SheetTitle>
              <Logo withName onClick={closeNav} />
            </SheetTitle>
            <VisuallyHidden>
              <SheetDescription>Navigation menu</SheetDescription>
            </VisuallyHidden>
          </SheetHeader>
          <SidebarGroup>
            {navLinks.main.map((link) => (
              <SidebarLink key={link.to} onClick={closeNav} {...link} />
            ))}
          </SidebarGroup>
          <SheetFooter className="p-0 py-4">
            <SidebarGroup>
              {navLinks.bottom.map((link) => (
                <SidebarLink key={link.to} onClick={closeNav} {...link} />
              ))}
              <ThemeSwitcher desktopOpen={true} />
            </SidebarGroup>
            <SidebarGroup>
              <ProfileButtonWithPopover open={open} onLinkClick={closeNav} />
            </SidebarGroup>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
