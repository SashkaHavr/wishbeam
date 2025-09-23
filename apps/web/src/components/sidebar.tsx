import type React from 'react';
import type { NavLinkProps } from 'utils/nav-links';
import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  EllipsisVerticalIcon,
  LogOutIcon,
  MoonIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SunIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { setCookie } from 'utils/cookie';
import { navLinks } from 'utils/nav-links';

import { useIsClient } from '~/hooks/use-is-client';
import { useSignout } from '~/lib/auth';
import { cn } from '~/lib/utils';
import { Logo } from './logo';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export const desktopSidebarOpenCookieName = 'desktopSidebarOpen';

function ProfileElements({ open = true }: { open?: boolean }) {
  return (
    <>
      <Avatar className="items-center justify-center">
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
  open,
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
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:border-sidebar-ring has-[>svg]:px-2 dark:hover:bg-sidebar-accent/50',
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
  canBeClosed,
  onOpenChange,
}: {
  open: boolean;
  canBeClosed: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <SidebarGroup className={cn(open ? 'flex-row' : 'gap-1')}>
      <Logo withName={open} className="p-0.5" />
      {canBeClosed && (
        <>
          <div className="grow" />
          <SidebarButton size="icon" onClick={() => onOpenChange?.(!open)}>
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

function useDesktopSidebarOpen(defaultValue = true) {
  const [isOpen, setIsOpen] = useState(defaultValue);
  useEffect(() => {
    setCookie(desktopSidebarOpenCookieName, JSON.stringify(isOpen));
  }, [isOpen]);
  return [isOpen, setIsOpen] as const;
}

export function Sidebar({
  className,
  desktopOpenDefault = true,
  desktopCanBeClosed = false,
  ...props
}: React.ComponentProps<'div'> & {
  desktopOpenDefault?: boolean;
  desktopCanBeClosed?: boolean;
}) {
  const signout = useSignout();
  const [desktopOpen, setDesktopOpen] = useDesktopSidebarOpen(
    desktopCanBeClosed ? desktopOpenDefault : true,
  );
  const theme = useTheme();
  const isClient = useIsClient();

  return (
    <div
      className={cn(
        'hidden h-full flex-col bg-sidebar p-2 text-sidebar-foreground transition-all md:flex',
        desktopOpen ? 'w-64' : 'w-17',
        className,
      )}
      {...props}
    >
      <SidebarHeader
        open={desktopOpen}
        canBeClosed={desktopCanBeClosed}
        onOpenChange={setDesktopOpen}
      />
      <SidebarGroup>
        {navLinks.main.map((link) => (
          <SidebarLink key={link.to} {...link} open={desktopOpen} />
        ))}
      </SidebarGroup>
      <div className="grow" />
      <SidebarGroup>
        {navLinks.bottom.map((link) => (
          <SidebarLink key={link.to} {...link} open={desktopOpen} />
        ))}
        {isClient ? (
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
        )}
      </SidebarGroup>
      <SidebarGroup>
        <Popover>
          <PopoverTrigger asChild>
            <SidebarButton
              className={cn(
                'items-center font-normal',
                desktopOpen && 'justify-start',
              )}
              size={desktopOpen ? 'lg' : 'icon'}
            >
              <ProfileElements open={desktopOpen} />
              {desktopOpen && (
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
