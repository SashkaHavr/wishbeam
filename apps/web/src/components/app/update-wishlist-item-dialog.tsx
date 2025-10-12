import { useState } from 'react';
import { revalidateLogic } from '@tanstack/react-form';

import type { TRPCOutput } from '@wishbeam/trpc';
import { wishlistItemSchema } from '@wishbeam/utils/schemas';

import { useUpdateWishlistItemMutation } from '~/hooks/mutations/wishlists.owned.items';
import {
  AppDialog,
  AppDialogClose,
  AppDialogContent,
  AppDialogDescription,
  AppDialogFooter,
  AppDialogHeader,
  AppDialogTitle,
} from '../app-dialog';
import { Form } from '../form/form';
import { FormSubmitButton } from '../form/form-submit-button';
import { useAppForm } from '../form/use-app-form';
import { WishlistItemFields } from '../form/wishlist-item-form.components';

export function UpdateWishlistItemDialog({
  children,
  wishlistId,
  wishlistItem,
}: {
  children: React.ReactNode;
  wishlistId: string;
  wishlistItem: TRPCOutput['wishlists']['owned']['items']['getAll']['wishlistItems'][number];
}) {
  const [open, setOpen] = useState(false);

  const updateWishlistItem = useUpdateWishlistItemMutation({ wishlistId });

  const form = useAppForm({
    defaultValues: {
      title: wishlistItem.title,
      description: wishlistItem.description,
      links: wishlistItem.links,
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: wishlistItemSchema,
    },
    onSubmit: ({ value, formApi }) => {
      updateWishlistItem.mutate({
        wishlistItemId: wishlistItem.id,
        data: value,
      });
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
              <AppDialogTitle>Update wishlist item</AppDialogTitle>
              <AppDialogDescription>
                Update the details for your wishlist item.
              </AppDialogDescription>
            </AppDialogHeader>
            <WishlistItemFields form={form} className="px-4 pt-4 md:p-0" />
            <AppDialogFooter>
              <AppDialogClose variant="outline">Cancel</AppDialogClose>
              <FormSubmitButton>Update wishlist item</FormSubmitButton>
            </AppDialogFooter>
          </Form>
        </form.AppForm>
      </AppDialogContent>
    </AppDialog>
  );
}
