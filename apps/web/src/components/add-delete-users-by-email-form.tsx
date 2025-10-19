import { revalidateLogic } from '@tanstack/react-form';
import { useRouteContext } from '@tanstack/react-router';
import { TRPCClientError } from '@trpc/client';
import { XIcon } from 'lucide-react';
import z from 'zod';

import { useLoggedInAuth } from '~/hooks/route-context';
import { cn } from '~/lib/utils';
import { Form } from './form/form';
import { FormField } from './form/form-field';
import { FormFieldError } from './form/form-field-error';
import { FormInputGroupInput } from './form/form-input-group-input';
import { FormInputGroupSubmitButton } from './form/form-input-group-submit-button';
import { useAppForm } from './form/use-app-form';
import { Button } from './ui/button';
import { InputGroup, InputGroupAddon } from './ui/input-group';
import { Item, ItemActions, ItemContent, ItemTitle } from './ui/item';

interface Props {
  className?: string;
  users: { email: string }[];
  addUser: (input: { email: string }) => void;
  deleteUser: (input: { email: string }) => void;
}

export function AddDeleteUsersByEmailForm({
  className,
  users,
  addUser,
  deleteUser,
}: Props) {
  const trpcClient = useRouteContext({
    from: '__root__',
    select: (ctx) => ctx.trpcClient,
  });
  const { user: currentUser } = useLoggedInAuth();

  const form = useAppForm({
    defaultValues: { email: '' },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: z.object({
        email: z.email().refine((email) => email !== currentUser.email, {
          error: 'You cannot add yourself',
        }),
      }),
      onSubmitAsync: async ({ value }) => {
        const exists = await trpcClient.users.exists.query({
          email: value.email,
        });
        return {
          fields: {
            email: exists
              ? undefined
              : { message: 'User with this email does not exist' },
          },
        };
      },
    },
    onSubmit: ({ value, formApi }) => {
      try {
        addUser(value);
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
    <div className={cn('mt-2 flex flex-col gap-2 p-1', className)}>
      {users.length > 0 && (
        <div className="flex flex-col">
          {users.map((user) => (
            <Item className="py-1" size="sm" key={user.email}>
              <ItemContent>
                <ItemTitle>{user.email}</ItemTitle>
              </ItemContent>
              <ItemActions>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() =>
                    deleteUser({
                      email: user.email,
                    })
                  }
                >
                  <XIcon />
                </Button>
              </ItemActions>
            </Item>
          ))}
        </div>
      )}
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
    </div>
  );
}
