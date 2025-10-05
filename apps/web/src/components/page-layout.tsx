import type React from 'react';

import { cn } from '~/lib/utils';

export function PageLayout({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'grid w-full grid-cols-limited-md px-4 pt-6 pb-4',
        className,
      )}
      {...props}
    >
      <div className="col-[1]" />
      <div className="col-[2]">{children}</div>
      <div className="col-[3]" />
    </div>
  );
}
