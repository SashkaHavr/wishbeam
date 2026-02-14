import { useQuery } from "@tanstack/react-query";

import {
  useAddWishlistOwnerMutation,
  useDeleteWishlistOwnerMutation,
} from "~/hooks/mutations/wishlists.owned.owners";
import { useTRPC } from "~/lib/trpc";

import { AddDeleteUsersByEmailForm } from "../add-delete-users-by-email-form";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "../ui/dialog";

interface Props {
  children?: React.ReactNode;
  wishlistId: string;
}

export function UpdateOwnersDialog({ children, wishlistId }: Props) {
  const trpc = useTRPC();
  const owners = useQuery(trpc.wishlists.owned.owners.getAll.queryOptions({ wishlistId }));

  const addOwner = useAddWishlistOwnerMutation();
  const deleteOwner = useDeleteWishlistOwnerMutation();

  return (
    <Dialog>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage owners</DialogTitle>
          <DialogDescription>Add or remove owners from your wishlist.</DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <AddDeleteUsersByEmailForm
            users={owners.data?.owners.filter((user) => user.role === "owner") ?? []}
            addUser={async ({ email }) => await addOwner.mutateAsync({ email, wishlistId })}
            deleteUser={({ userId }) => deleteOwner.mutate({ userId, wishlistId })}
          />
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
