import { createFileRoute } from '@tanstack/react-router';

import { HeroSection } from '~/components/landing/hero-section';

export const Route = createFileRoute('/{-$locale}/(public)/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col">
      <HeroSection />
    </div>
  );
}
