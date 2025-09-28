import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/{-$locale}/app/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/-$locale/app/settings"!</div>;
}
