import { permissions } from "#permissions.ts";
import { db } from "@wishbeam/db";
import { envAuth } from "@wishbeam/env/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  basePath: "/auth",
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
    secondaryStorage: process.env.REDIS_URL
    ? {
        get: async (key) => {
          return await redis.get(`auth:${key}`);
        },
        set: async (key, value, ttl) => {
          await redis.set(`auth:${key}`, value);
          if (ttl) await redis.expire(`auth:${key}`, ttl);
        },
        delete: async (key) => {
          await redis.del(`auth:${key}`);
        },
      }
    : undefined,
  socialProviders: {
    google:
      envAuth.GOOGLE_CLIENT_ID && envAuth.GOOGLE_CLIENT_SECRET
        ? {
            clientId: envAuth.GOOGLE_CLIENT_ID,
            clientSecret: envAuth.GOOGLE_CLIENT_SECRET,
          }
        : undefined,
  },
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
