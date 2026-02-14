import { revalidateLogic } from "@tanstack/react-form";
import { useState } from "react";

import type { TRPCOutput } from "@wishbeam/trpc";

import { wishlistSchema } from "@wishbeam/utils/schemas";
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
import { useUpdateWishlistMutation } from "~/hooks/mutations/wishlists.owned";

import { Form } from "../form/form";
import { FormSubmitButton } from "../form/form-submit-button";
import { useAppForm } from "../form/use-app-form";
import { WishlistFields } from "../form/wishlist-form.components";
import { Button } from "../ui/button";

interface Props {
  wishlist: TRPCOutput["wishlists"]["owned"]["getById"]["wishlist"];
  children?: React.ReactNode;
}

export function UpdateWishlistDialog({ wishlist, children }: Props) {
  const updateWishlist = useUpdateWishlistMutation();
  const [open, _setOpen] = useState(false);
  const setOpen = (isOpen: boolean) => {
    _setOpen(isOpen);
    if (!isOpen) {
      form.reset();
    }
  };

  const form = useAppForm({
    defaultValues: { title: wishlist.title, description: wishlist.description },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: wishlistSchema,
    },
    onSubmit: ({ value }) => {
      updateWishlist.mutate({ wishlistId: wishlist.id, data: value });
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <DialogContent>
        <form.AppForm>
          <Form className="flex w-full flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Update wishlist</DialogTitle>
              <DialogDescription>Edit a title and description for your wishlist.</DialogDescription>
            </DialogHeader>
            <DialogPanel>
              <WishlistFields form={form} />
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <FormSubmitButton>Update wishlist</FormSubmitButton>
            </DialogFooter>
          </Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
