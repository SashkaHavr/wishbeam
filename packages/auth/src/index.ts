import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';

import { db } from '@wishbeam/db';
import { user as userTable } from '@wishbeam/db/schema';
import { envAuth } from '@wishbeam/env/auth';

import { permissions } from '#permissions.ts';

export const auth = betterAuth({
  basePath: '/auth',
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  plugins: [
    admin({
      ...permissions,
    }),
  ],
  emailAndPassword: {
    enabled: envAuth.TEST_AUTH,
    disableSignUp: true,
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
});

if ((await db.$count(userTable)) === 0 && envAuth.TEST_AUTH) {
  await Promise.all(
    Array.from(Array(100).keys()).map((user) =>
      auth.api
        .createUser({
          body: {
            email: `user${user}@example.com`,
            password: `password${user}`,
            name: `Test User ${user}`,
          },
        })
        .catch(() => {
          /* user already exists */
        }),
    ),
  );
}
