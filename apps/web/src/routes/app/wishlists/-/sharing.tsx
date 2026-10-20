import { useQuery } from "@tanstack/react-query";
import { Schema } from "effect";
import { CheckIcon, CopyIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import type { ApiOutput } from "@wishbeam/api-contract";
import { ShareStatus } from "@wishbeam/api-contract/features/wishlists";
import { m } from "@wishbeam/intl/messages";
import { AddDeleteUsersByEmailForm } from "~/components/add-delete-users-by-email-form";
import { Button } from "~/components/ui/button";
import { Collapsible, CollapsibleContent } from "~/components/ui/collapsible";
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
import { InputGroup, InputGroupAddon, InputGroupInput } from "~/components/ui/input-group";
import { Label } from "~/components/ui/label";
import { RadioGroup, Radio } from "~/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";
import {
  useAddMember,
  useDeleteMember,
  useSetShareStatus,
  wishlistMembersQueryOptions,
} from "~/queries/wishlists";
import { getWishlistShareUrl } from "~/utils/share-url";

const shareItems = [
  { value: "private", title: m.wishlist_private, description: m.wishlist_privateDescription },
  { value: "shared", title: m.wishlist_shared, description: m.wishlist_sharedDescription },
  { value: "public", title: m.wishlist_public, description: m.wishlist_publicDescription },
] as const;

export function ShareWishlistDialog({
  children,
  wishlist,
}: {
  children?: ReactNode;
  wishlist: ApiOutput["wishlists"]["get"];
}) {
  const [open, setOpen] = useState(false);
  const users = useQuery({ ...wishlistMembersQueryOptions(wishlist.id), enabled: open });
  const addUser = useAddMember(wishlist.id);
  const deleteUser = useDeleteMember(wishlist.id);
  const updateWishlist = useSetShareStatus(wishlist.id);
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.wishlist_sharingTitle()}</DialogTitle>
          <DialogDescription>{m.wishlist_sharingDescription()}</DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <RadioGroup
            className="w-full"
            value={wishlist.shareStatus}
            onValueChange={(value) =>
              updateWishlist.mutate({ shareStatus: Schema.decodeUnknownSync(ShareStatus)(value) })
            }
          >
            {shareItems.map((item) => (
              <Label
                className="flex items-start gap-2 rounded-lg border p-3 hover:bg-accent/50 has-data-checked:border-primary/48 has-data-checked:bg-accent/50 dark:hover:bg-accent/20 dark:has-data-checked:bg-accent/20"
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
                      <p>{item.title()}</p>
                      <p className="text-xs text-muted-foreground">{item.description()}</p>
                    </div>
                    <Radio value={item.value} />
                  </div>
                  <CollapsibleContent>
                    {item.value === "shared" && (
                      <AddDeleteUsersByEmailForm
                        className="basis-full"
                        users={users.data ?? []}
                        addUser={addUser.mutateAsync}
                        deleteUser={({ userId }) => deleteUser.mutate(userId)}
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
                                    aria-label={m.action_copy()}
                                    size="icon-xs"
                                    variant="ghost"
                                    onClick={() =>
                                      copyToClipboard(getWishlistShareUrl(wishlist.id))
                                    }
                                  />
                                }
                              >
                                {isCopied ? <CheckIcon /> : <CopyIcon />}
                              </TooltipTrigger>
                              <TooltipContent>
                                {isCopied ? m.action_copied() : m.action_copyClipboard()}
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
          <DialogClose render={<Button variant="outline" />}>{m.action_close()}</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
