import type React from 'react';

import { useMatchesBreakpoint } from '~/hooks/use-breakpoint';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
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
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer';

export function ResponsiveDialog(
  props: React.ComponentProps<typeof Dialog> &
    React.ComponentProps<typeof Drawer>,
) {
  const desktop = useMatchesBreakpoint('md');
  const Component = desktop ? Dialog : Drawer;
  return <Component {...props} />;
}

export function ResponsiveDialogTrigger(
  props: React.ComponentProps<typeof DialogTrigger>,
) {
  const desktop = useMatchesBreakpoint('md');
  const Component = desktop ? DialogTrigger : DrawerTrigger;
  return <Component {...props} />;
}

export function ResponsiveDialogContent(
  props: React.ComponentProps<typeof DialogContent> &
    React.ComponentProps<typeof DrawerContent>,
) {
  const desktop = useMatchesBreakpoint('md');
  const Component = desktop ? DialogContent : DrawerContent;
  return <Component {...props} />;
}

export function ResponsiveDialogHeader(
  props: React.ComponentProps<typeof DialogHeader>,
) {
  const desktop = useMatchesBreakpoint('md');
  const Component = desktop ? DialogHeader : DrawerHeader;
  return <Component {...props} />;
}

export function ResponsiveDialogFooter(
  props: React.ComponentProps<typeof DialogFooter>,
) {
  const desktop = useMatchesBreakpoint('md');
  const Component = desktop ? DialogFooter : DrawerFooter;
  return <Component {...props} />;
}

export function ResponsiveDialogTitle(
  props: React.ComponentProps<typeof DialogTitle>,
) {
  const desktop = useMatchesBreakpoint('md');
  const Component = desktop ? DialogTitle : DrawerTitle;
  return <Component {...props} />;
}

export function ResponsiveDialogDescription(
  props: React.ComponentProps<typeof DialogDescription>,
) {
  const desktop = useMatchesBreakpoint('md');
  const Component = desktop ? DialogDescription : DrawerDescription;
  return <Component {...props} />;
}

export function ResponsiveDialogClose(
  props: React.ComponentProps<typeof DialogClose>,
) {
  const desktop = useMatchesBreakpoint('md');
  const Component = desktop ? DialogClose : DrawerClose;
  return <Component {...props} />;
}

export function ResponsiveDialogOverlay(
  props: React.ComponentProps<typeof DialogOverlay> &
    React.ComponentProps<typeof DrawerOverlay>,
) {
  const desktop = useMatchesBreakpoint('md');
  const Component = desktop ? DialogOverlay : DrawerOverlay;
  return <Component {...props} />;
}

export function ResponsiveDialogPortal(
  props: React.ComponentProps<typeof DialogPortal>,
) {
  const desktop = useMatchesBreakpoint('md');
  const Component = desktop ? DialogPortal : DrawerPortal;
  return <Component {...props} />;
}
