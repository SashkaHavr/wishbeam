import { useState } from "react";
import z from "zod";

import { wishlistItemSchema } from "@wishbeam/utils/schemas";
import { useUpdateWishlistItemMutation } from "~/hooks/mutations/wishlists.owned.items";

import {
  AppDialog,
  AppDialogBody,
  AppDialogClose,
  AppDialogContent,
  AppDialogDescription,
  AppDialogFooter,
  AppDialogHeader,
  AppDialogTitle,
} from "../app-dialog";
import { Form } from "../form/form";
import { FormSubmitButton } from "../form/form-submit-button";
import { useAppForm } from "../form/use-app-form";
import { WishlistItemFields } from "../form/wishlist-item-form.components";
import { Button } from "../ui/button";

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
    <AppDialog open={open} onOpenChange={setOpen}>
      {children}
      <AppDialogContent>
        <form.AppForm>
          <Form className="flex w-full flex-col gap-4">
            <AppDialogHeader>
              <AppDialogTitle>Update wishlist item</AppDialogTitle>
              <AppDialogDescription>
                Update the details for your wishlist item.
              </AppDialogDescription>
            </AppDialogHeader>
            <AppDialogBody>
              <WishlistItemFields form={form} />
            </AppDialogBody>
            <AppDialogFooter>
              <AppDialogClose render={<Button variant="outline" />}>Cancel</AppDialogClose>
              <FormSubmitButton>Update wishlist item</FormSubmitButton>
            </AppDialogFooter>
          </Form>
        </form.AppForm>
      </AppDialogContent>
    </AppDialog>
  );
}
