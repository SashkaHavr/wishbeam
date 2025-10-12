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
import { Form } from '../form/form';
import { FormSubmitButton } from '../form/form-submit-button';
import { useAppForm } from '../form/use-app-form';
import { WishlistFields } from '../form/wishlist-form.components';

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
          <Form className="flex w-full flex-col gap-4">
            <AppDialogHeader>
              <AppDialogTitle>Update wishlist</AppDialogTitle>
              <AppDialogDescription>
                Edit a title and description for your wishlist.
              </AppDialogDescription>
            </AppDialogHeader>
            <WishlistFields form={form} className="px-4 pt-4 md:p-0" />
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
