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
import { useUpdateWishlistMutation } from '~/hooks/mutations/wishlists.owned';
import { useAppForm } from '../form/use-app-form';

interface Props {
  wishlist: TRPCOutput['wishlists']['owned']['getById']['wishlist'];
  children?: React.ReactNode;
  state?: { open: boolean; onOpenChange: (open: boolean) => void };
}

export function UpdateWishlistDialog({ wishlist, children, state }: Props) {
  const updateWishlist = useUpdateWishlistMutation();
  const [_open, _setOpen] = useState(false);
  const open = state?.open ?? _open;
  const setOpen = state?.onOpenChange ?? _setOpen;

  const form = useAppForm({
    defaultValues: { title: wishlist.title, description: wishlist.description },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: wishlistSchema,
    },
    onSubmit: ({ value, formApi }) => {
      updateWishlist.mutate({ wishlistId: wishlist.id, data: value });
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
                  <field.FormField>
                    <field.FormFieldLabel>Title</field.FormFieldLabel>
                    <field.FormInput />
                    <field.FormFieldError />
                  </field.FormField>
                )}
              </form.AppField>
              <form.AppField name="description">
                {(field) => (
                  <field.FormField>
                    <field.FormFieldLabel>Description</field.FormFieldLabel>
                    <field.FormTextarea />
                    <field.FormFieldError />
                  </field.FormField>
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
