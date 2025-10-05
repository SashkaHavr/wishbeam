import React, { use } from 'react';

import { useMatchesBreakpoint } from '~/hooks/use-breakpoint';
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

export function AppDialog(props: React.ComponentProps<typeof Dialog>) {
  const desktop = useMatchesBreakpoint('md');
  const Component = desktop ? Dialog : Drawer;
  return (
    <AppDialogContext value={{ desktop }}>
      <Component {...props} />
    </AppDialogContext>
  );
}

export function AppDialogContent(
  props: React.ComponentProps<typeof DialogContent>,
) {
  const { desktop } = use(AppDialogContext);
  const Component = desktop ? DialogContent : DrawerContent;
  return <Component {...props} />;
}

export function AppDialogHeader(
  props: React.ComponentProps<typeof DialogHeader>,
) {
  const { desktop } = use(AppDialogContext);
  const Component = desktop ? DialogHeader : DrawerHeader;
  return <Component {...props} />;
}

export function AppDialogFooter(
  props: React.ComponentProps<typeof DialogFooter>,
) {
  const { desktop } = use(AppDialogContext);
  const Component = desktop ? DialogFooter : DrawerFooter;
  return <Component {...props} />;
}

export function AppDialogTitle(
  props: React.ComponentProps<typeof DialogTitle>,
) {
  const { desktop } = use(AppDialogContext);
  const Component = desktop ? DialogTitle : DrawerTitle;
  return <Component {...props} />;
}

export function AppDialogDescription(
  props: React.ComponentProps<typeof DialogDescription>,
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
