import { useQuery } from "@tanstack/react-query";
import { CheckIcon, CopyIcon } from "lucide-react";

import type { TRPCOutput } from "@wishbeam/trpc";

import { useSetShareStatusWishlistMutation } from "~/hooks/mutations/wishlists.owned";
import {
  useAddWishlistSharedWithMutation,
  useDeleteWishlistSharedWithMutation,
} from "~/hooks/mutations/wishlists.owned.sharedWith";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";
import { useTRPC } from "~/lib/trpc";
import { getWishlistShareUrl } from "~/utils/share-url";

import { AddDeleteUsersByEmailForm } from "../add-delete-users-by-email-form";
import {
  AppDialog,
  AppDialogBody,
  AppDialogClose,
  AppDialogContent,
  AppDialogDescription,
  AppDialogFooter,
  AppDialogHeader,
  AppDialogTitle,
} from "../app-dialog";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "../ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface Props {
  children?: React.ReactNode;
  wishlist: TRPCOutput["wishlists"]["owned"]["getById"]["wishlist"];
}

const shareItems = [
  {
    value: "private",
    title: "Private",
    description: "Only you can see this wishlist",
  },
  {
    value: "shared",
    title: "Shared",
    description: "Only people you specify can see this wishlist",
  },
  {
    value: "public",
    title: "Public",
    description: "Anyone with the link can see this wishlist",
  },
] satisfies {
  value: TRPCOutput["wishlists"]["owned"]["getById"]["wishlist"]["shareStatus"];
  title: string;
  description: string;
}[];

export function ShareWishlistDialog({ children, wishlist }: Props) {
  const trpc = useTRPC();
  const users = useQuery(
    trpc.wishlists.owned.sharedWith.getAll.queryOptions({
      wishlistId: wishlist.id,
    }),
  );

  const addUser = useAddWishlistSharedWithMutation();
  const deleteUser = useDeleteWishlistSharedWithMutation();
  const updateWishlist = useSetShareStatusWishlistMutation();

  const { isCopied, copyToClipboard } = useCopyToClipboard();

  return (
    <AppDialog>
      {children}
      <AppDialogContent>
        <AppDialogHeader>
          <AppDialogTitle>Manage sharing settings</AppDialogTitle>
          <AppDialogDescription>Change visibility of your wishlist</AppDialogDescription>
        </AppDialogHeader>
        <AppDialogBody>
          <RadioGroup
            value={wishlist.shareStatus}
            onValueChange={(value) =>
              updateWishlist.mutate({
                wishlistId: wishlist.id,
                shareStatus:
                  value as TRPCOutput["wishlists"]["owned"]["getById"]["wishlist"]["shareStatus"],
              })
            }
          >
            {shareItems.map((item) => (
              <FieldLabel htmlFor={`radio-group-shareStatus-${item.value}`} key={item.value}>
                <Field>
                  <Collapsible
                    open={
                      (item.value === "shared" && wishlist.shareStatus === "shared") ||
                      (item.value === "public" && wishlist.shareStatus === "public")
                    }
                  >
                    <div className="flex">
                      <FieldContent className="grow">
                        <FieldTitle>{item.title}</FieldTitle>
                        <FieldDescription>{item.description}</FieldDescription>
                      </FieldContent>
                      <RadioGroupItem
                        id={`radio-group-shareStatus-${item.value}`}
                        value={item.value}
                      />
                    </div>
                    <CollapsibleContent>
                      {item.value === "shared" && (
                        <AddDeleteUsersByEmailForm
                          className="basis-full"
                          users={users.data?.users ?? []}
                          addUser={async ({ email }) =>
                            await addUser.mutateAsync({
                              email,
                              wishlistId: wishlist.id,
                            })
                          }
                          deleteUser={({ userId }) =>
                            deleteUser.mutate({
                              userId,
                              wishlistId: wishlist.id,
                            })
                          }
                        />
                      )}
                      {item.value === "public" && (
                        <div className="mt-2 p-1">
                          <InputGroup>
                            <InputGroupInput
                              id="public-link"
                              value={getWishlistShareUrl(wishlist.id)}
                              readOnly
                            />
                            <InputGroupAddon align="inline-end">
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <InputGroupButton
                                      aria-label="Copy"
                                      title="Copy"
                                      size="icon-xs"
                                      onClick={() => {
                                        copyToClipboard(getWishlistShareUrl(wishlist.id));
                                      }}
                                    />
                                  }
                                >
                                  {isCopied ? <CheckIcon /> : <CopyIcon />}
                                </TooltipTrigger>
                                <TooltipContent>
                                  {isCopied ? "Copied" : "Copy to clipboard"}
                                </TooltipContent>
                              </Tooltip>
                            </InputGroupAddon>
                          </InputGroup>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
        </AppDialogBody>
        <AppDialogFooter>
          <AppDialogClose variant="outline">Close</AppDialogClose>
        </AppDialogFooter>
      </AppDialogContent>
    </AppDialog>
  );
}
