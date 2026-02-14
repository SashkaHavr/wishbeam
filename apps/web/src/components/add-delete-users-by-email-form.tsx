import { revalidateLogic } from "@tanstack/react-form";
import { TRPCClientError } from "@trpc/client";
import { XIcon } from "lucide-react";
import z from "zod";

import { useLoggedInAuth } from "~/hooks/route-context";
import { cn } from "~/lib/utils";

import { Form } from "./form/form";
import { FormField } from "./form/form-field";
import { FormFieldError } from "./form/form-field-error";
import { FormInputGroupInput } from "./form/form-input-group-input";
import { FormSubmitButton } from "./form/form-submit-button";
import { useAppForm } from "./form/use-app-form";
import { Button } from "./ui/button";
import { InputGroup, InputGroupAddon } from "./ui/input-group";
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from "./ui/item";

interface Props {
  className?: string;
  users: { id: string; name: string; email: string }[];
  addUser: (input: { email: string }) => Promise<unknown>;
  deleteUser: (input: { userId: string }) => void;
}

export function AddDeleteUsersByEmailForm({ className, users, addUser, deleteUser }: Props) {
  const { user: currentUser } = useLoggedInAuth();

  const form = useAppForm({
    defaultValues: { email: "" },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: z.object({
        email: z.email().refine((email) => email !== currentUser.email, {
          error: "You cannot add yourself",
        }),
      }),
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await addUser(value);
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
    <div className={cn("flex flex-col gap-2 p-1", users.length === 0 && "mt-1", className)}>
      {users.length > 0 && (
        <ItemGroup>
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
                      userId: user.id,
                    })
                  }
                >
                  <XIcon />
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      )}
      <form.AppForm>
        <Form className="flex w-full flex-col gap-4">
          <form.AppField name="email">
            {() => (
              <FormField>
                <InputGroup>
                  <FormInputGroupInput placeholder="user@example.com" />
                  <InputGroupAddon align="inline-end">
                    <FormSubmitButton variant="default">Add</FormSubmitButton>
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
