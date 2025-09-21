import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/{-$locale}/app')({
  beforeLoad: ({ context }) => {
    if (!context.auth.user) {
      throw redirect({ to: '/{-$locale}' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
