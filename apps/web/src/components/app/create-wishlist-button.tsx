import { useState } from 'react';
import { revalidateLogic } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';

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

export function CreateWishlistButton({
  defaultTitle = '',
}: {
  defaultTitle?: string;
}) {
  const trpc = useTRPC();
  const createWishlist = useMutation(
    trpc.wishlist.create.mutationOptions({
      onSuccess: (data, variables, onMutateResult, context) => {
        context.client.setQueryData(trpc.wishlist.getOwned.queryKey(), (old) =>
          old
            ? { wishlists: [...old.wishlists, data.newWishlist] }
            : { wishlists: [data.newWishlist] },
        );
        void context.client.invalidateQueries({
          queryKey: trpc.wishlist.getOwned.queryKey(),
        });
      },
    }),
  );
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
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <AppDialogTrigger size="lg" variant="outline">
        <PlusIcon />
        <span>Create new wishlist</span>
      </AppDialogTrigger>
      <ResponsiveDialogContent>
        <form.AppForm>
          <form.Form className="flex w-full flex-col gap-4">
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>Create new wishlist</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                Add a title and description to your wishlist.
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
              <form.FormSubmitButton>Create wishlist</form.FormSubmitButton>
            </ResponsiveDialogFooter>
          </form.Form>
        </form.AppForm>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
