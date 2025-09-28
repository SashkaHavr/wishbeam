import { useState } from 'react';
import { revalidateLogic } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { EditIcon } from 'lucide-react';

import type { TRPCOutput } from '@wishbeam/trpc';
import { wishlistSchema } from '@wishbeam/utils/schemas';

import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '~/components/responsive-dialog';
import { useTRPC } from '~/lib/trpc';
import { AppDialogClose, AppDialogTrigger } from '../app-dialog';
import { useAppForm } from '../form/use-app-form';

interface Props {
  wishlist: TRPCOutput['wishlist']['getById']['wishlist'];
}

export function UpdateWishlistButton({ wishlist }: Props) {
  const trpc = useTRPC();
  const updateWishlist = useMutation(
    trpc.wishlist.update.mutationOptions({
      onMutate: async (values, context) => {
        await context.client.cancelQueries({
          queryKey: trpc.wishlist.getOwned.queryKey(),
        });
        await context.client.cancelQueries({
          queryKey: trpc.wishlist.getById.queryKey({ id: values.id }),
        });

        const previous = {
          owned: context.client.getQueryData(trpc.wishlist.getOwned.queryKey()),
          byId: context.client.getQueryData(
            trpc.wishlist.getById.queryKey({ id: values.id }),
          ),
        };

        context.client.setQueryData(
          trpc.wishlist.getOwned.queryKey(),
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
          trpc.wishlist.getById.queryKey({ id: values.id }),
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
          trpc.wishlist.getOwned.queryKey(),
          onMutateResult.previous.owned,
        );
        context.client.setQueryData(
          trpc.wishlist.getById.queryKey({ id: values.id }),
          onMutateResult.previous.byId,
        );
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
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <AppDialogTrigger size="icon" variant="outline">
        <EditIcon />
      </AppDialogTrigger>
      <ResponsiveDialogContent>
        <form.AppForm>
          <form.Form className="flex w-full flex-col gap-4">
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>Update wishlist</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                Edit a title and description for your wishlist.
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
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
            <ResponsiveDialogFooter>
              <AppDialogClose variant="outline">Cancel</AppDialogClose>
              <form.FormSubmitButton>Update wishlist</form.FormSubmitButton>
            </ResponsiveDialogFooter>
          </form.Form>
        </form.AppForm>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
