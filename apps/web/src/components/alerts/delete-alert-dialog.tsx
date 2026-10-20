import { TrashIcon } from "lucide-react";

import { m } from "@wishbeam/intl/messages";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

export function DeleteAlertDialog({
  description,
  onClick,
  ...props
}: React.ComponentProps<typeof Button> & { description?: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" {...props} />}>
        <TrashIcon />
        <span>{m.action_delete()}</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{m.action_deleteTitle()}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? m.action_deleteDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="ghost" />}>
            {m.action_cancel()}
          </AlertDialogClose>
          <AlertDialogClose render={<Button variant="destructive" />} onClick={onClick}>
            {m.action_continue()}
          </AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
