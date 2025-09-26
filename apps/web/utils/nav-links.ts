import type { LinkProps } from '@tanstack/react-router';
import {
  CircleUserIcon,
  ListCheckIcon,
  SettingsIcon,
  Share2Icon,
} from 'lucide-react';

export interface NavLinkProps {
  to: LinkProps['to'];
  label: string;
  icon: React.ComponentType;
}

const mainLinks = [
  {
    to: '/{-$locale}/app/wishlists',
    label: 'My wishlists',
    icon: ListCheckIcon,
  },
  {
    to: '/{-$locale}/app/shared-wishlists',
    label: 'Shared with me wishlists',
    icon: Share2Icon,
  },
] satisfies NavLinkProps[];

const bottomLinks = [
  { to: '/{-$locale}', label: 'Settings', icon: SettingsIcon },
] satisfies NavLinkProps[];

const profileMenuLinks = [
  { to: '/{-$locale}', label: 'Account', icon: CircleUserIcon },
] satisfies NavLinkProps[];

export const navLinks = {
  main: mainLinks,
  bottom: bottomLinks,
  profileMenu: profileMenuLinks,
};
