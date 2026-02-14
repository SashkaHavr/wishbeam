import { useState } from "react";
import z from "zod";

import { wishlistItemSchema } from "@wishbeam/utils/schemas";
import { useCreateWishlistItemMutation } from "~/hooks/mutations/wishlists.owned.items";

import { Form } from "../form/form";
import { FormSubmitButton } from "../form/form-submit-button";
import { useAppForm } from "../form/use-app-form";
import { WishlistItemFields } from "../form/wishlist-item-form.components";
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

export function CreateWishlistItemDialog({
  children,
  wishlistId,
}: {
  children: React.ReactNode;
  wishlistId: string;
}) {
  const [open, _setOpen] = useState(false);
  const setOpen = (isOpen: boolean) => {
    _setOpen(isOpen);
    if (!isOpen) {
      form.reset();
    }
  };

  const createWishlistItem = useCreateWishlistItemMutation();

  const form = useAppForm({
    defaultValues: {
      title: "",
      description: "",
      estimatedPrice: "",
      links: [] as string[],
    },
    validators: {
      onSubmit: z.object({
        ...wishlistItemSchema.shape,
        estimatedPrice: wishlistItemSchema.shape.estimatedPrice.unwrap(),
      }),
    },
    onSubmit: async ({ value }) => {
      await createWishlistItem.mutateAsync({
        ...value,
        estimatedPrice: value.estimatedPrice === "" ? null : value.estimatedPrice,
        wishlistId,
      });
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
              <DialogTitle>Create new wishlist item</DialogTitle>
              <DialogDescription>Fill in the details for your new wishlist item.</DialogDescription>
            </DialogHeader>
            <DialogPanel>
              <WishlistItemFields form={form} />
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <FormSubmitButton>Create wishlist item</FormSubmitButton>
            </DialogFooter>
          </Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
