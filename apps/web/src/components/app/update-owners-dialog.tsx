import { revalidateLogic } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { TRPCClientError } from '@trpc/client';
import { XIcon } from 'lucide-react';
import z from 'zod';

import {
  useAddWishlistOwnerMutation,
  useDeleteWishlistOwnerMutation,
} from '~/hooks/mutations/wishlists.owned.owners';
import { useTRPC } from '~/lib/trpc';
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
import { FormField } from '../form/form-field';
import { FormFieldError } from '../form/form-field-error';
import { FormInputGroupInput } from '../form/form-input-group-input';
import { FormInputGroupSubmitButton } from '../form/form-input-group-submit-button';
import { useAppForm } from '../form/use-app-form';
import { Button } from '../ui/button';
import { InputGroup, InputGroupAddon } from '../ui/input-group';
import { Item, ItemActions, ItemContent, ItemTitle } from '../ui/item';

interface Props {
  children?: React.ReactNode;
  wishlistId: string;
}

export function UpdateOwnersDialog({ children, wishlistId }: Props) {
  const trpc = useTRPC();
  const owners = useQuery(
    trpc.wishlists.owned.owners.getAll.queryOptions({ wishlistId }),
  );

  const addOwner = useAddWishlistOwnerMutation();
  const deleteOwner = useDeleteWishlistOwnerMutation();

  const form = useAppForm({
    defaultValues: { email: '' },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: z.object({ email: z.email() }),
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await addOwner.mutateAsync({ ...value, wishlistId });
        formApi.reset();
      } catch (error) {
        if (error instanceof TRPCClientError) {
          formApi.fieldInfo.email.instance?.setErrorMap({
            onSubmit: { message: error.message },
          });
        }
      }
    },
  });

  return (
    <AppDialog onOpenChange={() => form.reset()}>
      {children}
      <AppDialogContent>
        <AppDialogHeader>
          <AppDialogTitle>Manage owners</AppDialogTitle>
          <AppDialogDescription>
            Add or remove owners from your wishlist.
          </AppDialogDescription>
        </AppDialogHeader>
        <AppDialogMainContent>
          <div className="flex flex-col">
            {owners.data?.owners.map((owner) => (
              <Item className="py-2" size="sm" key={owner.id}>
                <ItemContent>
                  <ItemTitle>{owner.email}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  {owner.role !== 'creator' ? (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() =>
                        deleteOwner.mutate({
                          userId: owner.id,
                          wishlistId: wishlistId,
                        })
                      }
                    >
                      <XIcon />
                    </Button>
                  ) : (
                    <div className="size-8" />
                  )}
                </ItemActions>
              </Item>
            ))}
          </div>
          <div className="my-4" />
          <form.AppForm>
            <Form className="flex w-full flex-col gap-4">
              <form.AppField name="email">
                {() => (
                  <FormField>
                    <InputGroup>
                      <FormInputGroupInput placeholder="user@example.com" />
                      <InputGroupAddon align="inline-end">
                        <FormInputGroupSubmitButton variant="default">
                          Add
                        </FormInputGroupSubmitButton>
                      </InputGroupAddon>
                    </InputGroup>
                    <FormFieldError />
                  </FormField>
                )}
              </form.AppField>
            </Form>
          </form.AppForm>
        </AppDialogMainContent>
        <AppDialogFooter>
          <AppDialogClose variant="outline">Close</AppDialogClose>
        </AppDialogFooter>
      </AppDialogContent>
    </AppDialog>
  );
}
