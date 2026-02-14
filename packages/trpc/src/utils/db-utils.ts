import { TRPCError } from "@trpc/server";

import type { db as dbType } from "@wishbeam/db";

export async function getUserByEmail(db: typeof dbType, email: string) {
  const user = await db.query.user.findFirst({
    where: { email },
  });
  if (!user) {
    throw new TRPCError({
      message: "User not found",
      code: "NOT_FOUND",
    });
  }
  return user;
}

export async function getUserById(db: typeof dbType, userId: string) {
  const user = await db.query.user.findFirst({
    where: { id: userId },
  });
  if (!user) {
    throw new TRPCError({
      message: "User not found",
      code: "NOT_FOUND",
    });
  }
  return user;
}
