import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/{-$locale}/app/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>App</div>;
}
