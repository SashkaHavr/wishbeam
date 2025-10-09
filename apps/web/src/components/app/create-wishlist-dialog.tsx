import React, { useState } from 'react';
import { revalidateLogic } from '@tanstack/react-form';

import { wishlistSchema } from '@wishbeam/utils/schemas';

import {
  AppDialog,
  AppDialogClose,
  AppDialogContent,
  AppDialogDescription,
  AppDialogFooter,
  AppDialogHeader,
  AppDialogTitle,
} from '~/components/app-dialog';
import { useCreateWishlistMutation } from '~/hooks/mutations/wishlists.owned';
import { useWishlistForm } from '../form/wishlist-form';
import { WishlistFields } from '../form/wishlist-form.components';

export function CreateWishlistDialog({
  defaultTitle = '',
  children,
}: {
  defaultTitle?: string;
  children: React.ReactNode;
}) {
  const createWishlist = useCreateWishlistMutation();

  const [open, setOpen] = useState(false);

  const form = useWishlistForm({
    defaultValues: { title: defaultTitle, description: '' },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: wishlistSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await createWishlist.mutateAsync(value);
      setOpen(false);
      formApi.reset();
    },
  });

  return (
    <AppDialog open={open} onOpenChange={setOpen}>
      {children}
      <AppDialogContent>
        <form.AppForm>
          <form.Form className="flex w-full flex-col gap-4">
            <AppDialogHeader>
              <AppDialogTitle>Create new wishlist</AppDialogTitle>
              <AppDialogDescription>
                Add a title and description to your wishlist.
              </AppDialogDescription>
            </AppDialogHeader>
            <WishlistFields form={form} className="px-4 pt-4 md:p-0" />
            <AppDialogFooter>
              <AppDialogClose variant="outline">Cancel</AppDialogClose>
              <form.FormSubmitButton>Create wishlist</form.FormSubmitButton>
            </AppDialogFooter>
          </form.Form>
        </form.AppForm>
      </AppDialogContent>
    </AppDialog>
  );
}
