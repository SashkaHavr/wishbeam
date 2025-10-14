import { useQuery } from '@tanstack/react-query';

import type { TRPCOutput } from '@wishbeam/trpc';

import { useUpdateWishlistMutation } from '~/hooks/mutations/wishlists.owned';
import {
  useAddWishlistSharedWithMutation,
  useDeleteWishlistSharedWithMutation,
} from '~/hooks/mutations/wishlists.owned.sharedWith';
import { useTRPC } from '~/lib/trpc';
import { AddDeleteUsersByEmailForm } from '../add-delete-users-by-email-form';
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
import { Collapsible, CollapsibleContent } from '../ui/collapsible';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '../ui/field';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface Props {
  children?: React.ReactNode;
  wishlist: TRPCOutput['wishlists']['owned']['getById']['wishlist'];
}

const shareItems = [
  {
    value: 'private',
    title: 'Private',
    description: 'Only you can see this wishlist',
  },
  {
    value: 'shared',
    title: 'Shared',
    description: 'Only people you specify can see this wishlist',
  },
  {
    value: 'public',
    title: 'Public',
    description: 'Anyone with the link can see this wishlist',
  },
] satisfies {
  value: TRPCOutput['wishlists']['owned']['getById']['wishlist']['shareStatus'];
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
  const updateWishlist = useUpdateWishlistMutation();

  return (
    <AppDialog>
      {children}
      <AppDialogContent>
        <AppDialogHeader>
          <AppDialogTitle>Manage sharing settings</AppDialogTitle>
          <AppDialogDescription>
            Change visibility of your wishlist
          </AppDialogDescription>
        </AppDialogHeader>
        <AppDialogMainContent>
          <RadioGroup
            value={wishlist.shareStatus}
            onValueChange={(value) =>
              updateWishlist.mutate({
                wishlistId: wishlist.id,
                data: {
                  shareStatus:
                    value as TRPCOutput['wishlists']['owned']['getById']['wishlist']['shareStatus'],
                },
              })
            }
          >
            {shareItems.map((item) => (
              <FieldLabel
                htmlFor={`radio-group-shareStatus-${item.value}`}
                key={item.value}
              >
                <Field>
                  <Collapsible open={wishlist.shareStatus === 'shared'}>
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
                      {item.value === 'shared' && (
                        <AddDeleteUsersByEmailForm
                          className="basis-full"
                          users={users.data?.users ?? []}
                          addUser={async ({ email }) =>
                            await addUser.mutateAsync({
                              email,
                              wishlistId: wishlist.id,
                            })
                          }
                          deleteUser={async ({ userId }) =>
                            await deleteUser.mutateAsync({
                              userId,
                              wishlistId: wishlist.id,
                            })
                          }
                        />
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
        </AppDialogMainContent>
        <AppDialogFooter>
          <AppDialogClose variant="outline">Close</AppDialogClose>
        </AppDialogFooter>
      </AppDialogContent>
    </AppDialog>
  );
}
