import { Link } from '@tanstack/react-router';
import { Gift } from 'lucide-react';

import { cn } from '~/lib/utils';

export function Logo({
  withName,
  size = 'lg',
}: {
  withName?: boolean;
  size?: 'md' | 'lg';
}) {
  return (
    <Link
      to="/{-$locale}"
      aria-label="home"
      className="flex items-center gap-2 font-medium text-secondary-foreground"
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-md',
          { md: 'size-6', lg: 'size-8' }[size],
        )}
      >
        <Gift className={cn({ md: 'size-4', lg: 'size-6' }[size])} />
      </div>
      <span className={cn(!withName && 'sr-only')}>Wishbeam</span>
    </Link>
  );
}
