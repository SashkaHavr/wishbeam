import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/{-$locale}/app/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="text-8xl font-bold">
      <p>App</p>
      <p>App</p>
      <p>App</p>
      <p>App</p>
      <p>App</p>
      <p>App</p>
      <p>App</p>
      <p>App</p>
      <p>App</p>
      <p>App</p>
      <p>App</p>
      <p>App</p>
      <p>App</p>
      <p>App</p>
    </div>
  );
}
