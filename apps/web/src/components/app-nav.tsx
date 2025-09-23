import type React from 'react';

import { useMobileDesktop } from '~/hooks/use-breakpoint';
import { cn } from '~/lib/utils';
import { MobileNav } from './mobile-nav';
import { Sidebar } from './sidebar';
import { Separator } from './ui/separator';

export function AppNav({
  className,
  children,
  desktopSidebarOpenDefault,
  ...props
}: React.ComponentProps<'div'> & { desktopSidebarOpenDefault?: boolean }) {
  const { mobile, desktop } = useMobileDesktop();
  return (
    <div
      className={cn('flex h-screen flex-col md:flex-row', className)}
      {...props}
    >
      {desktop && (
        <>
          <Sidebar
            desktopCanBeClosed
            desktopOpenDefault={desktopSidebarOpenDefault}
          />
          <Separator orientation="vertical" className="hidden md:block" />
        </>
      )}
      {mobile && (
        <>
          <MobileNav />
          <Separator orientation="horizontal" className="md:hidden" />
        </>
      )}
      <div className="grow overflow-y-auto">{children}</div>
    </div>
  );
}
