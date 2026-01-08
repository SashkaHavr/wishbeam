import { useState } from "react";
import z from "zod";

import { wishlistItemSchema } from "@wishbeam/utils/schemas";
import { useCreateWishlistItemMutation } from "~/hooks/mutations/wishlists.owned.items";

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
    <AppDialog open={open} onOpenChange={setOpen}>
      {children}
      <AppDialogContent>
        <form.AppForm>
          <Form className="flex w-full flex-col gap-4">
            <AppDialogHeader>
              <AppDialogTitle>Create new wishlist item</AppDialogTitle>
              <AppDialogDescription>
                Fill in the details for your new wishlist item.
              </AppDialogDescription>
            </AppDialogHeader>
            <AppDialogBody>
              <WishlistItemFields form={form} />
            </AppDialogBody>
            <AppDialogFooter>
              <AppDialogClose variant="outline">Cancel</AppDialogClose>
              <FormSubmitButton>Create wishlist item</FormSubmitButton>
            </AppDialogFooter>
          </Form>
        </form.AppForm>
      </AppDialogContent>
    </AppDialog>
  );
}
