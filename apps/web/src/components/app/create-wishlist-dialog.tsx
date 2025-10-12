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
  AppDialogMainContent,
  AppDialogTitle,
} from '~/components/app-dialog';
import { useCreateWishlistMutation } from '~/hooks/mutations/wishlists.owned';
import { Form } from '../form/form';
import { FormSubmitButton } from '../form/form-submit-button';
import { useAppForm } from '../form/use-app-form';
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

  const form = useAppForm({
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
          <Form className="flex w-full flex-col gap-4">
            <AppDialogHeader>
              <AppDialogTitle>Create new wishlist</AppDialogTitle>
              <AppDialogDescription>
                Add a title and description to your wishlist.
              </AppDialogDescription>
            </AppDialogHeader>
            <AppDialogMainContent>
              <WishlistFields form={form} />
            </AppDialogMainContent>
            <AppDialogFooter>
              <AppDialogClose variant="outline">Cancel</AppDialogClose>
              <FormSubmitButton>Create wishlist</FormSubmitButton>
            </AppDialogFooter>
          </Form>
        </form.AppForm>
      </AppDialogContent>
    </AppDialog>
  );
}
