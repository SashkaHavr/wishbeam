import { useState } from 'react';
import { revalidateLogic } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';

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
import { useTRPC } from '~/lib/trpc';
import { useAppForm } from '../form/use-app-form';

interface Props {
  wishlist: TRPCOutput['ownedWishlist']['getById']['wishlist'];
  children: React.ReactNode;
}

export function UpdateWishlistDialog({ wishlist, children }: Props) {
  const trpc = useTRPC();
  const updateWishlist = useMutation(
    trpc.ownedWishlist.update.mutationOptions({
      onMutate: async (values, context) => {
        await context.client.cancelQueries({
          queryKey: trpc.ownedWishlist.getAll.queryKey(),
        });
        await context.client.cancelQueries({
          queryKey: trpc.ownedWishlist.getById.queryKey({ id: values.id }),
        });

        const previous = {
          owned: context.client.getQueryData(
            trpc.ownedWishlist.getAll.queryKey(),
          ),
          byId: context.client.getQueryData(
            trpc.ownedWishlist.getById.queryKey({ id: values.id }),
          ),
        };

        context.client.setQueryData(
          trpc.ownedWishlist.getAll.queryKey(),
          (old) => {
            if (!old) return old;
            return {
              wishlists: old.wishlists.map((wishlist) =>
                wishlist.id === values.id
                  ? { ...wishlist, ...values.data }
                  : wishlist,
              ),
            };
          },
        );
        context.client.setQueryData(
          trpc.ownedWishlist.getById.queryKey({ id: values.id }),
          (old) => {
            if (!old) return old;
            return { wishlist: { ...old.wishlist, ...values.data } };
          },
        );

        return { previous };
      },
      onError: (err, values, onMutateResult, context) => {
        if (!onMutateResult) return;
        context.client.setQueryData(
          trpc.ownedWishlist.getAll.queryKey(),
          onMutateResult.previous.owned,
        );
        context.client.setQueryData(
          trpc.ownedWishlist.getById.queryKey({ id: values.id }),
          onMutateResult.previous.byId,
        );
      },
      onSettled: (data, error, values, onMutateResult, context) => {
        void context.client.invalidateQueries({
          queryKey: trpc.ownedWishlist.getAll.queryKey(),
        });
        void context.client.invalidateQueries({
          queryKey: trpc.ownedWishlist.getById.queryKey({ id: values.id }),
        });
      },
    }),
  );
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
