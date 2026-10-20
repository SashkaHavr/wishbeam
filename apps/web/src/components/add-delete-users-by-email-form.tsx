import { revalidateLogic } from "@tanstack/react-form";
import { Predicate, Schema } from "effect";
import { XIcon } from "lucide-react";

import type { ApiOutput } from "@wishbeam/api-contract";
import { MemberInput } from "@wishbeam/api-contract/features/wishlists";
import type { IdBranded } from "@wishbeam/db/id-branded";
import { m } from "@wishbeam/intl/messages";
import { useSession } from "~/lib/auth";
import { cn } from "~/lib/utils";

import {
  FormForm,
  FormField,
  FormFieldError,
  FormInputGroupInput,
  FormSubmitButton,
  useAppForm,
} from "./form";
import { Button } from "./ui/button";
import { InputGroup, InputGroupAddon } from "./ui/input-group";
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from "./ui/item";

interface Props {
  className?: string;
  users: ReadonlyArray<ApiOutput["wishlists"]["getMembers"][number]>;
  addUser: (input: { email: string }) => Promise<unknown>;
  deleteUser: (input: { userId: IdBranded<"user"> }) => void;
}

export function AddDeleteUsersByEmailForm({ className, users, addUser, deleteUser }: Props) {
  const { user: currentUser } = useSession();
  const form = useAppForm({
    defaultValues: { email: "" },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: Schema.toStandardSchemaV1(
        MemberInput.check(
          Schema.makeFilter((value) => value.email !== currentUser.email || m.member_cannotSelf()),
        ),
      ),
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await addUser(value);
        formApi.reset();
      } catch (error) {
        formApi.setErrorMap({
          onSubmit: {
            fields: {
              email: Predicate.isTagged(error, "WishlistUserNotFound")
                ? m.error_userNotFound()
                : Predicate.isTagged(error, "WishlistMemberConflict")
                  ? m.error_memberConflict()
                  : m.routeDefault_error(),
            },
          },
        });
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
                  aria-label={m.action_remove()}
                  onClick={() => deleteUser({ userId: user.id })}
                >
                  <XIcon />
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      )}
      <form.AppForm>
        <FormForm>
          <form.AppField name="email">
            {() => (
              <FormField>
                <InputGroup>
                  <FormInputGroupInput
                    placeholder="user@example.com"
                    aria-label={m.member_email()}
                  />
                  <InputGroupAddon align="inline-end">
                    <FormSubmitButton variant="default">{m.action_add()}</FormSubmitButton>
                  </InputGroupAddon>
                </InputGroup>
                <FormFieldError />
              </FormField>
            )}
          </form.AppField>
        </FormForm>
      </form.AppForm>
    </div>
  );
}
