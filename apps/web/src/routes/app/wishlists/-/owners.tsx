import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

import type { IdBranded } from "@wishbeam/db/id-branded";
import { m } from "@wishbeam/intl/messages";
import { AddDeleteUsersByEmailForm } from "~/components/add-delete-users-by-email-form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "~/components/ui/dialog";
import { useAddOwner, useDeleteOwner, wishlistOwnersQueryOptions } from "~/queries/wishlists";

export function UpdateOwnersDialog({
  children,
  wishlistId,
}: {
  children?: ReactNode;
  wishlistId: IdBranded<"wishlist">;
}) {
  const [open, setOpen] = useState(false);
  const owners = useQuery({ ...wishlistOwnersQueryOptions(wishlistId), enabled: open });
  const addOwner = useAddOwner(wishlistId);
  const deleteOwner = useDeleteOwner(wishlistId);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.wishlist_ownersTitle()}</DialogTitle>
          <DialogDescription>{m.wishlist_ownersDescription()}</DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <AddDeleteUsersByEmailForm
            users={owners.data?.filter((user) => user.role === "owner") ?? []}
            addUser={addOwner.mutateAsync}
            deleteUser={({ userId }) => deleteOwner.mutate(userId)}
          />
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{m.action_close()}</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
