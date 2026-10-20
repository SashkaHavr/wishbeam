import { Loader2Icon } from "lucide-react";
import type React from "react";

import { m } from "@wishbeam/intl/messages";
import { cn } from "~/lib/utils";

export function Spinner({
  className,
  ...props
}: React.ComponentProps<typeof Loader2Icon>): React.ReactElement {
  return (
    <Loader2Icon
      aria-label={m.status_loading()}
      className={cn("animate-spin", className)}
      role="status"
      {...props}
    />
  );
}
