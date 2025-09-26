import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/{-$locale}/app/')({
  beforeLoad: () => {
    throw redirect({ to: '/{-$locale}/app/wishlists' });
  },
});
