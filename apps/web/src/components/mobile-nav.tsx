import type React from 'react';
import type { NavLinkProps } from 'utils/nav-links';
import { useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Link, useMatchRoute } from '@tanstack/react-router';
import { MenuIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { navLinks } from 'utils/nav-links';

import { useIsClient } from '~/hooks/use-is-client';
import { cn } from '~/lib/utils';
import { Logo } from './logo';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
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

function MobileNavLink({
  icon: IconProp,
  label,
  ...props
}: Omit<React.ComponentProps<typeof MobileNavButton>, 'children'> &
  NavLinkProps & { open?: boolean }) {
  return (
    <MobileNavButton
      asChild
      className="data-[status=active]:bg-primary data-[status=active]:text-primary-foreground data-[status=active]:hover:bg-primary/90 data-[status=active]:dark:hover:bg-primary/50"
      {...props}
    >
      <Link to={props.to}>
        <IconProp />
        <span>{label}</span>
      </Link>
    </MobileNavButton>
  );
}

function MobileNavButton({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'variant'>) {
  return (
    <Button
      variant="ghost"
      className={cn('w-full justify-start transition-none', className)}
      {...props}
    />
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
  const theme = useTheme();
  const isClient = useIsClient();

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
              <MobileNavLink key={link.to} {...link} />
            ))}
          </div>
          <SheetFooter className="p-0 px-2 py-4">
            <div className="flex flex-col gap-1">
              {navLinks.bottom.map((link) => (
                <MobileNavLink key={link.to} {...link} />
              ))}
              {isClient ? (
                <MobileNavButton
                  onClick={() =>
                    theme.setTheme(
                      theme.resolvedTheme === 'light' ? 'dark' : 'light',
                    )
                  }
                >
                  {theme.resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
                  <span>
                    {theme.resolvedTheme === 'dark'
                      ? 'Light mode'
                      : 'Dark mode'}
                  </span>
                </MobileNavButton>
              ) : (
                <Skeleton className="size-9" />
              )}
            </div>
            <Separator />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 px-2">
                <Avatar className="items-center justify-center transition-none">
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <span className="truncate font-medium">Profile</span>
              </div>
              {navLinks.profileMenu.map((link) => (
                <MobileNavLink key={link.to} {...link} />
              ))}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
