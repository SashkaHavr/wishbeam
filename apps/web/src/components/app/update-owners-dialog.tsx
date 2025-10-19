import { useQuery } from '@tanstack/react-query';

import {
  useAddWishlistOwnerMutation,
  useDeleteWishlistOwnerMutation,
} from '~/hooks/mutations/wishlists.owned.owners';
import { useTRPC } from '~/lib/trpc';
import { AddDeleteUsersByEmailForm } from '../add-delete-users-by-email-form';
import {
  AppDialog,
  AppDialogClose,
  AppDialogContent,
  AppDialogDescription,
  AppDialogFooter,
  AppDialogHeader,
  AppDialogMainContent,
  AppDialogTitle,
} from '../app-dialog';

interface Props {
  children?: React.ReactNode;
  wishlistId: string;
}

export function UpdateOwnersDialog({ children, wishlistId }: Props) {
  const trpc = useTRPC();
  const owners = useQuery(
    trpc.wishlists.owned.owners.getAll.queryOptions({ wishlistId }),
  );

  const addOwner = useAddWishlistOwnerMutation();
  const deleteOwner = useDeleteWishlistOwnerMutation();

  return (
    <AppDialog>
      {children}
      <AppDialogContent>
        <AppDialogHeader>
          <AppDialogTitle>Manage owners</AppDialogTitle>
          <AppDialogDescription>
            Add or remove owners from your wishlist.
          </AppDialogDescription>
        </AppDialogHeader>
        <AppDialogMainContent>
          <AddDeleteUsersByEmailForm
            users={
              owners.data?.owners.filter((user) => user.role === 'owner') ?? []
            }
            addUser={({ email }) => addOwner.mutate({ email, wishlistId })}
            deleteUser={({ email }) =>
              deleteOwner.mutate({ email, wishlistId })
            }
          />
        </AppDialogMainContent>
        <AppDialogFooter>
          <AppDialogClose variant="outline">Close</AppDialogClose>
        </AppDialogFooter>
      </AppDialogContent>
    </AppDialog>
  );
}
