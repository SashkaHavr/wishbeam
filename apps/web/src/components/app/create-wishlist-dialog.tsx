import { revalidateLogic } from "@tanstack/react-form";
import React, { useState } from "react";

import { wishlistSchema } from "@wishbeam/utils/schemas";
import {
  AppDialog,
  AppDialogBody,
  AppDialogClose,
  AppDialogContent,
  AppDialogDescription,
  AppDialogFooter,
  AppDialogHeader,
  AppDialogTitle,
} from "~/components/app-dialog";
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
    <AppDialog open={open} onOpenChange={setOpen}>
      {children}
      <AppDialogContent>
        <form.AppForm>
          <Form className="flex w-full flex-col gap-4">
            <AppDialogHeader>
              <AppDialogTitle>Create new wishlist</AppDialogTitle>
              <AppDialogDescription>
                Add a title and description to your wishlist.
              </AppDialogDescription>
            </AppDialogHeader>
            <AppDialogBody>
              <WishlistFields form={form} />
            </AppDialogBody>
            <AppDialogFooter>
              <AppDialogClose render={<Button variant="outline" />}>Cancel</AppDialogClose>
              <FormSubmitButton>Create wishlist</FormSubmitButton>
            </AppDialogFooter>
          </Form>
        </form.AppForm>
      </AppDialogContent>
    </AppDialog>
  );
}
