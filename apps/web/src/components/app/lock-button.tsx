import type React from 'react';
import { LockIcon, UnlockIcon } from 'lucide-react';

import { Button } from '../ui/button';

export function LockButton({
  lockStatus,
  lockAction,
  unlockAction,
  ...props
}: Omit<
  React.ComponentProps<typeof Button>,
  'children' | 'onClick' | 'disabled'
> & {
  lockStatus: 'unlocked' | 'lockedByCurrentUser' | 'lockedByAnotherUser';
  lockAction?: () => void;
  unlockAction?: () => void;
}) {
  return (
    <Button
      variant={lockStatus === 'unlocked' ? 'default' : 'outline'}
      disabled={lockStatus === 'lockedByAnotherUser'}
      onClick={() => {
        if (lockStatus === 'unlocked') {
          lockAction?.();
        } else if (lockStatus === 'lockedByCurrentUser') {
          unlockAction?.();
        }
      }}
      {...props}
    >
      {lockStatus === 'unlocked' && (
        <>
          <LockIcon />
          <span>Lock item</span>
        </>
      )}
      {lockStatus === 'lockedByCurrentUser' && (
        <>
          <UnlockIcon />
          <span>Unlock item</span>
        </>
      )}
      {lockStatus === 'lockedByAnotherUser' && (
        <>
          <LockIcon />
          <span>Locked</span>
        </>
      )}
    </Button>
  );
}
