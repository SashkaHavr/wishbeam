import { revalidateLogic } from "@tanstack/react-form";
import { Schema } from "effect";
import type { ReactNode } from "react";
import { useState } from "react";

import type { ApiInput, ApiOutput } from "@wishbeam/api-contract";
import { WishlistInput } from "@wishbeam/api-contract/features/wishlists";
import { m } from "@wishbeam/intl/messages";
import {
  FormField,
  FormFieldError,
  FormFieldLabel,
  FormForm,
  FormInput,
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
import { useCreateWishlist, useUpdateWishlist } from "~/queries/wishlists";

function WishlistFormDialog({
  initialValue,
  onSave,
  children,
  update = false,
}: {
  initialValue: ApiInput["wishlists"]["create"]["payload"];
  onSave: (value: ApiInput["wishlists"]["create"]["payload"]) => Promise<unknown>;
  children?: ReactNode;
  update?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const form = useAppForm({
    defaultValues: initialValue,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: Schema.toStandardSchemaV1(
        WishlistInput.mapFields((fields) => ({
          ...fields,
          title: fields.title.annotate({ message: m.error_wishlistTitle() }),
        })),
      ),
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await onSave(Schema.decodeSync(WishlistInput)(value));
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
          <FormForm>
            <DialogHeader>
              <DialogTitle>{update ? m.wishlist_update() : m.wishlist_createNew()}</DialogTitle>
              <DialogDescription>
                {update ? m.wishlist_updateDescription() : m.wishlist_createDescription()}
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
              </div>
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>{m.action_cancel()}</DialogClose>
              <FormSubmitButton>
                {update ? m.wishlist_update() : m.wishlist_createSubmit()}
              </FormSubmitButton>
            </DialogFooter>
          </FormForm>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}

export function CreateWishlistDialog({
  defaultTitle = "",
  children,
}: {
  defaultTitle?: string;
  children: ReactNode;
}) {
  const create = useCreateWishlist();
  return (
    <WishlistFormDialog
      initialValue={{ title: defaultTitle, description: "" }}
      onSave={create.mutateAsync}
    >
      {children}
    </WishlistFormDialog>
  );
}

export function UpdateWishlistDialog({
  wishlist,
  children,
}: {
  wishlist: ApiOutput["wishlists"]["get"];
  children?: ReactNode;
}) {
  const update = useUpdateWishlist(wishlist.id);
  return (
    <WishlistFormDialog
      update
      initialValue={{ title: wishlist.title, description: wishlist.description }}
      onSave={update.mutateAsync}
    >
      {children}
    </WishlistFormDialog>
  );
}
