import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)')({
  beforeLoad: ({ context, matches }) => {
    if (matches.some((m) => m.routeId === '/(public)/shared/$id')) return;

    if (context.auth.user) {
      throw redirect({ to: '/app' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
