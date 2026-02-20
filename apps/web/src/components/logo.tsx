import { Link } from "@tanstack/react-router";
import { Gift } from "lucide-react";

import { cn } from "~/lib/utils";

export function Logo({
  withName,
  size = "lg",
  className,
  ...props
}: {
  withName?: boolean;
  size?: "md" | "lg";
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      to="/"
      aria-label="home"
      className={cn("flex items-center gap-2  text-secondary-foreground", className)}
      {...props}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-primary/16 shadow-[0_0_12px] shadow-primary/20",
          { md: "size-7", lg: "size-9" }[size],
        )}
      >
        <Gift className={cn("text-primary", { md: "size-4", lg: "size-5" }[size])} />
      </div>
      <span
        className={cn("tracking-tight font-heading font-medium text-lg", !withName && "sr-only")}
      >
        Wishbeam
      </span>
    </Link>
  );
}
