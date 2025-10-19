import z from 'zod';

import { db } from '@wishbeam/db';

import { protectedProcedure, router } from '#init.ts';

export const usersRouter = router({
  exists: protectedProcedure
    .input(z.object({ email: z.email() }))
    .output(z.boolean())
    .query(async ({ input }) => {
      const user = await db.query.user.findFirst({
        where: { email: input.email },
      });
      return !!user;
    }),
});
