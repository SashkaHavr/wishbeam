import { Schema } from "effect";
import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import type { ApiInput, ApiOutput } from "@wishbeam/api-contract";
import { EstimatedPrice, WishlistItemInput } from "@wishbeam/api-contract/features/wishlist-items";
import type { IdBranded } from "@wishbeam/db/id-branded";
import { m } from "@wishbeam/intl/messages";
import {
  FormField,
  FormFieldError,
  FormFieldLabel,
  FormForm,
  FormInput,
  FormInputGroupInput,
  FormSubmitButton,
  useAppForm,
} from "~/components/form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "~/components/ui/dialog";
import { Fieldset, FieldsetLegend } from "~/components/ui/fieldset";
import { InputGroup, InputGroupAddon } from "~/components/ui/input-group";
import { useCreateWishlistItem, useUpdateWishlistItem } from "~/queries/wishlists";

type ItemInput = ApiInput["wishlistItems"]["create"]["payload"];
type Item = Pick<
  ApiOutput["wishlistItems"]["getAll"][number],
  "id" | "title" | "description" | "links" | "estimatedPrice"
>;
const ItemFormSchema = Schema.Struct({
  ...WishlistItemInput.fields,
  links: Schema.mutable(WishlistItemInput.fields.links),
  estimatedPrice: EstimatedPrice,
});

function ItemFormDialog({
  initialValue,
  onSave,
  children,
  update = false,
}: {
  initialValue: ItemInput;
  onSave: (value: ItemInput) => Promise<unknown>;
  children: ReactNode;
  update?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const form = useAppForm({
    defaultValues: {
      ...initialValue,
      links: [...initialValue.links],
      estimatedPrice: initialValue.estimatedPrice ?? "",
    },
    validators: { onSubmit: Schema.toStandardSchemaV1(ItemFormSchema) },
    onSubmit: async ({ value, formApi }) => {
      try {
        await onSave(
          Schema.decodeSync(WishlistItemInput)({
            ...value,
            estimatedPrice: value.estimatedPrice === "" ? null : value.estimatedPrice,
          }),
        );
        setOpen(false);
        if (!update) formApi.reset();
      } catch {
        form.setErrorMap({ onSubmit: { fields: { title: m.routeDefault_error() } } });
      }
    },
  });
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) form.reset();
      }}
    >
      {children}
      <DialogContent>
        <form.AppForm>
          <FormForm className="contents">
            <DialogHeader>
              <DialogTitle>{update ? m.item_update() : m.item_createNew()}</DialogTitle>
              <DialogDescription>
                {update ? m.item_updateDescription() : m.item_createDescription()}
              </DialogDescription>
            </DialogHeader>
            <DialogPanel>
              <div className="flex flex-col gap-4">
                <form.AppField name="title">
                  {() => (
                    <FormField>
                      <FormFieldLabel>{m.wishlist_title()}</FormFieldLabel>
                      <FormInput />
                      <FormFieldError />
                    </FormField>
                  )}
                </form.AppField>
                <form.AppField name="description">
                  {() => (
                    <FormField>
                      <FormFieldLabel>{m.wishlist_description()}</FormFieldLabel>
                      <FormInput />
                      <FormFieldError />
                    </FormField>
                  )}
                </form.AppField>
                <form.AppField name="estimatedPrice">
                  {() => (
                    <FormField>
                      <FormFieldLabel>{m.item_estimatedPrice()}</FormFieldLabel>
                      <FormInput />
                      <FormFieldError />
                    </FormField>
                  )}
                </form.AppField>
                <form.AppField name="links" mode="array">
                  {(field) => (
                    <Fieldset className="gap-4">
                      <FieldsetLegend>{m.item_links()}</FieldsetLegend>
                      <div className="flex flex-col gap-4">
                        {field.state.value.map((_, index) => (
                          <form.AppField key={index} name={`links[${index}]`}>
                            {() => (
                              <FormField>
                                <InputGroup>
                                  <FormInputGroupInput placeholder="https://example.com/" />
                                  <InputGroupAddon align="inline-end">
                                    <Button
                                      variant="ghost"
                                      size="icon-xs"
                                      aria-label={m.item_removeLink()}
                                      onClick={() => field.removeValue(index)}
                                    >
                                      <XIcon />
                                    </Button>
                                  </InputGroupAddon>
                                </InputGroup>
                                <FormFieldError />
                              </FormField>
                            )}
                          </form.AppField>
                        ))}
                        {field.state.value.length < 5 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              field.pushValue("");
                              setTimeout(() => {
                                const input = document.querySelector(
                                  `input[name="links[${field.state.value.length - 1}]"]`,
                                );
                                if (input instanceof HTMLInputElement) input.focus();
                              }, 0);
                            }}
                          >
                            {m.item_addLink()}
                          </Button>
                        )}
                      </div>
                    </Fieldset>
                  )}
                </form.AppField>
              </div>
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>{m.action_cancel()}</DialogClose>
              <FormSubmitButton>
                {update ? m.item_update() : m.item_createSubmit()}
              </FormSubmitButton>
            </DialogFooter>
          </FormForm>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}

export function CreateWishlistItemDialog({
  wishlistId,
  children,
}: {
  wishlistId: IdBranded<"wishlist">;
  children: ReactNode;
}) {
  const create = useCreateWishlistItem(wishlistId);
  return (
    <ItemFormDialog
      initialValue={{ title: "", description: "", estimatedPrice: null, links: [] }}
      onSave={create.mutateAsync}
    >
      {children}
    </ItemFormDialog>
  );
}

export function UpdateWishlistItemDialog({
  wishlistId,
  wishlistItem,
  children,
}: {
  wishlistId: IdBranded<"wishlist">;
  wishlistItem: Item;
  children: ReactNode;
}) {
  const update = useUpdateWishlistItem(wishlistId, wishlistItem.id);
  return (
    <ItemFormDialog update initialValue={wishlistItem} onSave={update.mutateAsync}>
      {children}
    </ItemFormDialog>
  );
}
