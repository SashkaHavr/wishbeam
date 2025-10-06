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
import { useCreateWishlistMutation } from '~/hooks/mutations/wishlist';
import { useAppForm } from '../form/use-app-form';

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
          <form.Form className="flex w-full flex-col gap-4">
            <AppDialogHeader>
              <AppDialogTitle>Create new wishlist</AppDialogTitle>
              <AppDialogDescription>
                Add a title and description to your wishlist.
              </AppDialogDescription>
            </AppDialogHeader>
            <div className="flex flex-col gap-4 p-4 pb-0 md:p-0">
              <form.AppField name="title">
                {(field) => (
                  <field.FormFieldset>
                    <field.FormLabel>Title</field.FormLabel>
                    <field.FormInput />
                  </field.FormFieldset>
                )}
              </form.AppField>
              <form.AppField name="description">
                {(field) => (
                  <field.FormFieldset>
                    <field.FormLabel>Description</field.FormLabel>
                    <field.FormTextarea />
                  </field.FormFieldset>
                )}
              </form.AppField>
            </div>
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
