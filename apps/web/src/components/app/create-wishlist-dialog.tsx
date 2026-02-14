import { revalidateLogic } from "@tanstack/react-form";
import React, { useState } from "react";

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
import { useCreateWishlistMutation } from "~/hooks/mutations/wishlists.owned";

import { Form } from "../form/form";
import { FormSubmitButton } from "../form/form-submit-button";
import { useAppForm } from "../form/use-app-form";
import { WishlistFields } from "../form/wishlist-form.components";
import { Button } from "../ui/button";

export function CreateWishlistDialog({
  defaultTitle = "",
  children,
}: {
  defaultTitle?: string;
  children: React.ReactNode;
}) {
  const createWishlist = useCreateWishlistMutation();

  const [open, _setOpen] = useState(false);
  const setOpen = (isOpen: boolean) => {
    _setOpen(isOpen);
    if (!isOpen) {
      form.reset();
    }
  };

  const form = useAppForm({
    defaultValues: { title: defaultTitle, description: "" },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: wishlistSchema,
    },
    onSubmit: async ({ value }) => {
      await createWishlist.mutateAsync(value);
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
              <DialogTitle>Create new wishlist</DialogTitle>
              <DialogDescription>Add a title and description to your wishlist.</DialogDescription>
            </DialogHeader>
            <DialogPanel>
              <WishlistFields form={form} />
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <FormSubmitButton>Create wishlist</FormSubmitButton>
            </DialogFooter>
          </Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
