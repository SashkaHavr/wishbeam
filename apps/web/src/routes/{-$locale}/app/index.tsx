import { createFileRoute } from '@tanstack/react-router';

import { Button } from '~/components/ui/button';

import { useSignout } from '~/lib/auth';

export const Route = createFileRoute('/{-$locale}/app/')({
  component: RouteComponent,
});

function RouteComponent() {
  const signout = useSignout();
  return <Button onClick={() => signout.mutate()}>Logout</Button>;
}
