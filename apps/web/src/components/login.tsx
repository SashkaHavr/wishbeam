import { useRouteContext } from "@tanstack/react-router";

import { m } from "@wishbeam/intl/messages";
import { cn } from "~/lib/utils";
import { useGoogleSignIn } from "~/queries/auth";

import { Google } from "./icons/brands";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "./ui/dialog";
import { Fieldset } from "./ui/fieldset";

export function LoginButtons() {
  const config = useRouteContext({ from: "__root__", select: (context) => context.authConfig });
  const login = useGoogleSignIn(config.googleEmulate);
  return (
    <Fieldset>
      <Button variant="outline" type="button" onClick={() => login.mutate()}>
        <Google />
        {m.auth_loginGoogle()}
      </Button>
    </Fieldset>
  );
}

export function LoginCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{m.auth_welcome()}</CardTitle>
          <CardDescription>{m.auth_signInDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginButtons />
        </CardContent>
      </Card>
    </div>
  );
}

export function LoginDialog({
  children,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & { children?: React.ReactNode }) {
  return (
    <Dialog {...props}>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.auth_login()}</DialogTitle>
          <DialogDescription>{m.auth_loginDescription()}</DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <LoginButtons />
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{m.action_close()}</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
