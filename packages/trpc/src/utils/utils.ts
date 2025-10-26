export function getWishlistItemLockStatus({
  lockUserId,
  currentUserId,
}: {
  lockUserId: string | null;
  currentUserId?: string;
}) {
  if (lockUserId === null) {
    return 'unlocked';
  }
  if (lockUserId === currentUserId) {
    return 'lockedByCurrentUser';
  }
  return 'lockedByAnotherUser';
}
