import { useState } from 'react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { UserIcon } from 'lucide-react';

import { useAuth } from '~/hooks/route-context';
import { authClient, useResetAuth } from '~/lib/auth';
import { useTRPC } from '~/lib/trpc';
import { cn } from '~/lib/utils';
import {
  AppDialog,
  AppDialogBody,
  AppDialogClose,
  AppDialogContent,
  AppDialogDescription,
  AppDialogFooter,
  AppDialogHeader,
  AppDialogTitle,
} from './app-dialog';
import { Google } from './icons/brands';
import { LoginDialogContext } from './login-context';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Field, FieldDescription, FieldGroup } from './ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';
import { Spinner } from './ui/spinner';

export function LoginButtons() {
  const trpc = useTRPC();
  const authConfig = useSuspenseQuery(trpc.config.authConfig.queryOptions());
  const resetAuth = useResetAuth();

  const [selectedTestUser, setSelectedTestUser] = useState<string>('0');
  const loginAsTestUser = useMutation({
    mutationFn: async ({ user }: { user: number }) => {
      if (!authConfig.data.testAuth) return;
      await authClient.signIn.email({
        email: `user${user}@example.com`,
        password: `password${user}`,
      });
      await resetAuth();
    },
  });

  return (
    <FieldGroup>
      {authConfig.data.testAuth && (
        <>
          <Field className="grid grid-cols-2">
            <Button
              variant="outline"
              type="button"
              onClick={() =>
                loginAsTestUser.mutate({
                  user: parseInt(selectedTestUser),
                })
              }
              disabled={loginAsTestUser.isPending}
            >
              {loginAsTestUser.isPending && <Spinner />}
              <UserIcon />
              Login with
            </Button>
            <Select
              value={selectedTestUser}
              onValueChange={setSelectedTestUser}
            >
              <SelectTrigger>
                <span>{`Test User ${selectedTestUser}`}</span>
              </SelectTrigger>
              <SelectContent>
                {Array.from(Array(100).keys()).map((user) => (
                  <SelectItem key={user} value={user.toString()}>
                    Test User {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </>
      )}
      {authConfig.data.google && (
        <Field>
          <Button variant="outline" type="button">
            <Google />
            Login with Google
          </Button>
        </Field>
      )}
    </FieldGroup>
  );
}

export function LoginCard({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome</CardTitle>
          <CardDescription>Sign in below to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginButtons />
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}

export function LoginDialog(props: React.ComponentProps<typeof AppDialog>) {
  return (
    <AppDialog {...props}>
      <AppDialogContent>
        <AppDialogHeader>
          <AppDialogTitle>Log in</AppDialogTitle>
          <AppDialogDescription>Please log in to continue</AppDialogDescription>
        </AppDialogHeader>
        <AppDialogBody>
          <LoginButtons />
        </AppDialogBody>
        <AppDialogFooter>
          <AppDialogClose />
        </AppDialogFooter>
      </AppDialogContent>
    </AppDialog>
  );
}

export function LoginDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const auth = useAuth();

  return (
    <LoginDialogContext value={{ openLoginDialog: () => setIsOpen(true) }}>
      <LoginDialog
        open={auth.loggedIn ? false : isOpen}
        onOpenChange={setIsOpen}
      />
      {children}
    </LoginDialogContext>
  );
}
