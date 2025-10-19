import { useState } from 'react';
import { revalidateLogic } from '@tanstack/react-form';

import type { TRPCOutput } from '@wishbeam/trpc';
import { wishlistSchema } from '@wishbeam/utils/schemas';

import {
  AppDialog,
  AppDialogBody,
  AppDialogClose,
  AppDialogContent,
  AppDialogDescription,
  AppDialogFooter,
  AppDialogHeader,
  AppDialogTitle,
} from '~/components/app-dialog';
import { useUpdateWishlistMutation } from '~/hooks/mutations/wishlists.owned';
import { Form } from '../form/form';
import { FormSubmitButton } from '../form/form-submit-button';
import { useAppForm } from '../form/use-app-form';
import { WishlistFields } from '../form/wishlist-form.components';

interface Props {
  wishlist: TRPCOutput['wishlists']['owned']['getById']['wishlist'];
  children?: React.ReactNode;
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
          <Form className="flex w-full flex-col gap-4">
            <AppDialogHeader>
              <AppDialogTitle>Update wishlist</AppDialogTitle>
              <AppDialogDescription>
                Edit a title and description for your wishlist.
              </AppDialogDescription>
            </AppDialogHeader>
            <AppDialogBody>
              <WishlistFields form={form} />
            </AppDialogBody>
            <AppDialogFooter>
              <AppDialogClose variant="outline">Cancel</AppDialogClose>
              <FormSubmitButton>Update wishlist</FormSubmitButton>
            </AppDialogFooter>
          </Form>
        </form.AppForm>
      </AppDialogContent>
    </AppDialog>
  );
}
