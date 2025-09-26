import {
  ResponsiveDialogClose,
  ResponsiveDialogTrigger,
} from './responsive-dialog';
import { Button } from './ui/button';

export function AppDialogTrigger(props: React.ComponentProps<typeof Button>) {
  return (
    <ResponsiveDialogTrigger asChild>
      <Button {...props} />
    </ResponsiveDialogTrigger>
  );
}

export function AppDialogClose(props: React.ComponentProps<typeof Button>) {
  return (
    <ResponsiveDialogClose asChild>
      <Button {...props} />
    </ResponsiveDialogClose>
  );
}
