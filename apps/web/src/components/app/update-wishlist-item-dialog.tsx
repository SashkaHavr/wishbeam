import { useState } from "react";
import z from "zod";

import { wishlistItemSchema } from "@wishbeam/utils/schemas";
import { useUpdateWishlistItemMutation } from "~/hooks/mutations/wishlists.owned.items";

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

export function UpdateWishlistItemDialog({
  children,
  wishlistId,
  wishlistItem,
}: {
  children: React.ReactNode;
  wishlistId: string;
  wishlistItem: {
    id: string;
    title: string;
    description: string;
    links: string[];
    estimatedPrice: string | null;
  };
}) {
  const [open, _setOpen] = useState(false);
  const setOpen = (isOpen: boolean) => {
    _setOpen(isOpen);
    if (!isOpen) {
      form.reset();
    }
  };

  const updateWishlistItem = useUpdateWishlistItemMutation({ wishlistId });

  const form = useAppForm({
    defaultValues: {
      title: wishlistItem.title,
      description: wishlistItem.description,
      estimatedPrice: wishlistItem.estimatedPrice ?? "",
      links: wishlistItem.links,
    },
    validators: {
      onSubmit: z.object({
        ...wishlistItemSchema.shape,
        estimatedPrice: wishlistItemSchema.shape.estimatedPrice.unwrap(),
      }),
    },
    onSubmit: ({ value }) => {
      updateWishlistItem.mutate({
        wishlistItemId: wishlistItem.id,
        data: {
          ...value,
          estimatedPrice: value.estimatedPrice === "" ? null : value.estimatedPrice,
        },
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
              <DialogTitle>Update wishlist item</DialogTitle>
              <DialogDescription>Update the details for your wishlist item.</DialogDescription>
            </DialogHeader>
            <DialogPanel>
              <WishlistItemFields form={form} />
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <FormSubmitButton>Update wishlist item</FormSubmitButton>
            </DialogFooter>
          </Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
