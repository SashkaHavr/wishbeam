import { useState } from 'react';
import { revalidateLogic } from '@tanstack/react-form';

import type { TRPCOutput } from '@wishbeam/trpc';
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
import { useUpdateWishlistMutation } from '~/hooks/mutations/wishlist';
import { useAppForm } from '../form/use-app-form';

interface Props {
  wishlist: TRPCOutput['ownedWishlist']['getById']['wishlist'];
  children: React.ReactNode;
}

export function UpdateWishlistDialog({ wishlist, children }: Props) {
  const updateWishlist = useUpdateWishlistMutation();
  const [open, setOpen] = useState(false);

  const form = useAppForm({
    defaultValues: { title: wishlist.title, description: wishlist.description },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: wishlistSchema,
    },
    onSubmit: ({ value, formApi }) => {
      updateWishlist.mutate({ id: wishlist.id, data: value });
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
              <AppDialogTitle>Update wishlist</AppDialogTitle>
              <AppDialogDescription>
                Edit a title and description for your wishlist.
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
              <form.FormSubmitButton>Update wishlist</form.FormSubmitButton>
            </AppDialogFooter>
          </form.Form>
        </form.AppForm>
      </AppDialogContent>
    </AppDialog>
  );
}
