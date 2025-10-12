import { useState } from 'react';
import { revalidateLogic } from '@tanstack/react-form';

import { wishlistItemSchema } from '@wishbeam/utils/schemas';

import { useCreateWishlistItemMutation } from '~/hooks/mutations/wishlists.owned.items';
import {
  AppDialog,
  AppDialogClose,
  AppDialogContent,
  AppDialogDescription,
  AppDialogFooter,
  AppDialogHeader,
  AppDialogMainContent,
  AppDialogTitle,
} from '../app-dialog';
import { Form } from '../form/form';
import { FormSubmitButton } from '../form/form-submit-button';
import { useAppForm } from '../form/use-app-form';
import { WishlistItemFields } from '../form/wishlist-item-form.components';

export function CreateWishlistItemDialog({
  children,
  wishlistId,
}: {
  children: React.ReactNode;
  wishlistId: string;
}) {
  const [open, setOpen] = useState(false);

  const createWishlistItem = useCreateWishlistItemMutation();

  const form = useAppForm({
    defaultValues: { title: '', description: '', links: [] as string[] },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: wishlistItemSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await createWishlistItem.mutateAsync({ ...value, wishlistId });
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
              <AppDialogTitle>Create new wishlist item</AppDialogTitle>
              <AppDialogDescription>
                Fill in the details for your new wishlist item.
              </AppDialogDescription>
            </AppDialogHeader>
            <AppDialogMainContent>
              <WishlistItemFields form={form} />
            </AppDialogMainContent>
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
