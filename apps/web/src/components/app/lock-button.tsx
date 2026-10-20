import { LockIcon, UnlockIcon } from "lucide-react";
import type React from "react";

import { m } from "@wishbeam/intl/messages";
import { cn } from "~/lib/utils";

import { Button } from "../ui/button";

export function LockButton({
  lockStatus,
  lockAction,
  unlockAction,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "children" | "onClick" | "disabled"> & {
  lockStatus: "unlocked" | "lockedByCurrentUser" | "lockedByAnotherUser";
  lockAction?: () => void;
  unlockAction?: () => void;
}) {
  return (
    <Button
      variant={lockStatus === "unlocked" ? "default" : "outline"}
      disabled={lockStatus === "lockedByAnotherUser"}
      className={cn(
        lockStatus === "lockedByCurrentUser" &&
          "border-success text-success-foreground hover:bg-success/8",
        lockStatus === "lockedByAnotherUser" && "text-muted-foreground opacity-60",
        className,
      )}
      onClick={() => {
        if (lockStatus === "unlocked") {
          lockAction?.();
        } else if (lockStatus === "lockedByCurrentUser") {
          unlockAction?.();
        }
      }}
      {...props}
    >
      {lockStatus === "unlocked" && (
        <>
          <LockIcon />
          <span>{m.item_lock()}</span>
        </>
      )}
      {lockStatus === "lockedByCurrentUser" && (
        <>
          <UnlockIcon />
          <span>{m.item_unlock()}</span>
        </>
      )}
      {lockStatus === "lockedByAnotherUser" && (
        <>
          <LockIcon />
          <span>{m.item_locked()}</span>
        </>
      )}
    </Button>
  );
}
