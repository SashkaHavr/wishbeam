import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/app/shared-wishlists')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/-$locale/app/shared-wishlists"!</div>;
}
