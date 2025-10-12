import React, { use } from 'react';

import { useMatchesBreakpoint } from '~/hooks/use-breakpoint';
import { cn } from '~/lib/utils';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer';

const AppDialogContext = React.createContext({ desktop: true });

export function AppDialog(
  props: React.ComponentProps<typeof Dialog | typeof Drawer>,
) {
  const desktop = useMatchesBreakpoint('md');
  const Component = desktop ? Dialog : Drawer;
  return (
    <AppDialogContext value={{ desktop }}>
      <Component {...props} />
    </AppDialogContext>
  );
}

export function AppDialogContent(
  props: React.ComponentProps<typeof DialogContent | typeof DrawerContent>,
) {
  const { desktop } = use(AppDialogContext);
  const Component = desktop ? DialogContent : DrawerContent;
  return <Component {...props} />;
}

export function AppDialogHeader(
  props: React.ComponentProps<typeof DialogHeader | typeof DrawerHeader>,
) {
  const { desktop } = use(AppDialogContext);
  const Component = desktop ? DialogHeader : DrawerHeader;
  return <Component {...props} />;
}

export function AppDialogFooter(
  props: React.ComponentProps<typeof DialogFooter | typeof DrawerFooter>,
) {
  const { desktop } = use(AppDialogContext);
  const Component = desktop ? DialogFooter : DrawerFooter;
  return <Component {...props} />;
}

export function AppDialogTitle(
  props: React.ComponentProps<typeof DialogTitle | typeof DrawerTitle>,
) {
  const { desktop } = use(AppDialogContext);
  const Component = desktop ? DialogTitle : DrawerTitle;
  return <Component {...props} />;
}

export function AppDialogDescription(
  props: React.ComponentProps<
    typeof DialogDescription | typeof DrawerDescription
  >,
) {
  const { desktop } = use(AppDialogContext);
  const Component = desktop ? DialogDescription : DrawerDescription;
  return <Component {...props} />;
}

export function AppDialogTrigger(props: React.ComponentProps<typeof Button>) {
  const { desktop } = use(AppDialogContext);
  const Component = desktop ? DialogTrigger : DrawerTrigger;

  return (
    <Component asChild>
      <Button {...props} />
    </Component>
  );
}

export function AppDialogClose(props: React.ComponentProps<typeof Button>) {
  const { desktop } = use(AppDialogContext);
  const Component = desktop ? DialogClose : DrawerClose;
  return (
    <Component asChild>
      <Button {...props} />
    </Component>
  );
}

export function AppDialogMainContent({
  className,
  ...props
}: React.ComponentProps<'div'> & { asChild?: boolean }) {
  return <div className={cn('px-4 pt-4 md:p-0', className)} {...props} />;
}
