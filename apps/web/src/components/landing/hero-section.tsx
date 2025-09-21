import React from 'react';
import { Link } from '@tanstack/react-router';
import { ListTodo } from 'lucide-react';

import { AnimatedGroup } from '~/components/ui/animated-group';
import { Button } from '~/components/ui/button';
import { TextEffect } from '~/components/ui/text-effect';

import { HeroHeader } from './hero-header';

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring',
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
} satisfies React.ComponentProps<typeof AnimatedGroup>['variants'];

export function HeroSection() {
  return (
    <>
      <HeroHeader />

      <main className="overflow-hidden [--color-primary-foreground:var(--color-white)] [--color-primary:var(--color-green-600)]">
        <section>
          <div className="relative mx-auto max-w-6xl px-6 pt-32 pb-20 lg:pt-48">
            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <TextEffect
                preset="fade-in-blur"
                speedSegment={0.3}
                as="h1"
                className="text-5xl font-medium text-balance md:text-6xl"
              >
                Share your wishlist
              </TextEffect>
              <TextEffect
                per="line"
                preset="fade-in-blur"
                speedSegment={0.3}
                delay={0.5}
                as="p"
                className="mx-auto mt-6 max-w-2xl text-lg text-pretty"
              >
                Create and share your wishlist with friends and family.
              </TextEffect>

              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.75,
                      },
                    },
                  },
                  ...transitionVariants,
                }}
                className="mt-12"
              >
                <div className="mt-8">
                  <Button size="lg" asChild>
                    <Link to="/{-$locale}/login">
                      <ListTodo className="relative size-4" />
                      <span className="text-nowrap">Create your wishlist</span>
                    </Link>
                  </Button>
                </div>
              </AnimatedGroup>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
