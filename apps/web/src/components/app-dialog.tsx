import React, { use } from "react";

import { useMatchesBreakpoint } from "~/hooks/use-breakpoint";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

const AppDialogContext = React.createContext({ desktop: true });

export function AppDialog(props: React.ComponentProps<typeof Dialog | typeof Sheet>) {
  const desktop = useMatchesBreakpoint("md");
  const Component = desktop ? Dialog : Sheet;

  return (
    <AppDialogContext value={{ desktop }}>
      <Component {...props} />
    </AppDialogContext>
  );
}

export function AppDialogContent({
  children,
  ...props
}: React.ComponentProps<typeof DialogContent | typeof SheetContent>) {
  const { desktop } = use(AppDialogContext);

  if (desktop) {
    return (
      <DialogContent className="max-h-[80vh] overflow-auto" {...props}>
        {children}
      </DialogContent>
    );
  }
  return (
    <SheetContent {...props} side="bottom">
      <div className="max-h-[70vh] overflow-auto">{children}</div>
    </SheetContent>
  );
}

export function AppDialogHeader(
  props: React.ComponentProps<typeof DialogHeader | typeof SheetHeader>,
) {
  const { desktop } = use(AppDialogContext);
  const Component = desktop ? DialogHeader : SheetHeader;
  return <Component {...props} />;
}

export function AppDialogFooter(
  props: React.ComponentProps<typeof DialogFooter | typeof SheetFooter>,
) {
  const { desktop } = use(AppDialogContext);
  const Component = desktop ? DialogFooter : SheetFooter;
  return <Component {...props} />;
}

export function AppDialogTitle(
  props: React.ComponentProps<typeof DialogTitle | typeof SheetTitle>,
) {
  const { desktop } = use(AppDialogContext);
  const Component = desktop ? DialogTitle : SheetTitle;
  return <Component {...props} />;
}

export function AppDialogDescription(
  props: React.ComponentProps<typeof DialogDescription | typeof SheetDescription>,
) {
  const { desktop } = use(AppDialogContext);
  const Component = desktop ? DialogDescription : SheetDescription;
  return <Component {...props} />;
}

export function AppDialogTrigger(props: React.ComponentProps<typeof Button>) {
  const { desktop } = use(AppDialogContext);
  const Component = desktop ? DialogTrigger : SheetTrigger;

  return <Component render={<Button {...props} />} />;
}

export function AppDialogClose(props: React.ComponentProps<typeof Button>) {
  const { desktop } = use(AppDialogContext);
  const Component = desktop ? DialogClose : SheetClose;
  return <Component render={<Button {...props} />} />;
}

export function AppDialogBody({
  className,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  return <div className={cn("px-4 pt-4 md:p-0", className)} {...props} />;
}
