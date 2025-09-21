import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/{-$locale}/(public)')({
  beforeLoad: ({ context }) => {
    if (context.auth.user) {
      throw redirect({ to: '/{-$locale}/app' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
