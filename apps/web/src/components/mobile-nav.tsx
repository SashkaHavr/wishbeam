import type React from 'react';

import { cn } from '~/lib/utils';
import { Logo } from './logo';

export function MobileNav({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex w-full items-center px-2.5 py-3 md:hidden',
        className,
      )}
      {...props}
    >
      <Logo withName />
    </div>
  );
}
