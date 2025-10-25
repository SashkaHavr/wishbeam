import { TRPCError } from '@trpc/server';

import { db } from '@wishbeam/db';

export async function getUserByEmail(email: string) {
  const user = await db.query.user.findFirst({
    where: { email },
  });
  if (!user) {
    throw new TRPCError({
      message: 'User not found',
      code: 'UNPROCESSABLE_CONTENT',
    });
  }
  return user;
}

export async function getUserById(userId: string) {
  const user = await db.query.user.findFirst({
    where: { id: userId },
  });
  if (!user) {
    throw new TRPCError({
      message: 'User not found',
      code: 'UNPROCESSABLE_CONTENT',
    });
  }
  return user;
}
