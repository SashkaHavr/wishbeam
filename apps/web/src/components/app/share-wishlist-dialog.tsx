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
import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "../ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { Label } from "../ui/label";
import { RadioGroup, Radio } from "../ui/radio-group";
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
    <Dialog>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage sharing settings</DialogTitle>
          <DialogDescription>Change visibility of your wishlist</DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <RadioGroup
            className="w-full"
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
              <Label
                className="flex items-start gap-2 rounded-lg border p-3 hover:bg-accent/50 has-data-checked:border-primary/48 has-data-checked:bg-accent/50"
                key={item.value}
              >
                <Collapsible
                  className="w-full"
                  open={
                    (item.value === "shared" && wishlist.shareStatus === "shared") ||
                    (item.value === "public" && wishlist.shareStatus === "public")
                  }
                >
                  <div className="flex w-full gap-2">
                    <div className="flex grow flex-col gap-1">
                      <p>{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <Radio value={item.value} />
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
                                  <Button
                                    aria-label="Copy"
                                    size="icon-xs"
                                    variant="ghost"
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
              </Label>
            ))}
          </RadioGroup>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
