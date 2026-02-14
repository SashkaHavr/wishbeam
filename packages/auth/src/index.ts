import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { RedisClient } from "bun";

import { logPlugin } from "#log-plugin.ts";
import { ac, roles } from "#permissions.ts";
import { db } from "@wishbeam/db";
import { envAuth } from "@wishbeam/env/auth";
import { envRedis } from "@wishbeam/env/redis";

const redis = new RedisClient(envRedis.REDIS_URL, { autoReconnect: false });

export const auth = betterAuth({
  basePath: "/auth",
  session: {
    cookieCache: {
      enabled: true,
      // 5 minutes
      maxAge: 5 * 60,
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  secondaryStorage: envRedis.REDIS_URL
    ? {
        get: async (key) => {
          return await redis.get(`auth:${key}`);
        },
        set: async (key, value, ttl) => {
          await redis.set(`auth:${key}`, value);
          if (ttl !== undefined && ttl !== 0) await redis.expire(`auth:${key}`, ttl);
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
  plugins: [admin({ ac, roles }), logPlugin],
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

export type AuthType = typeof auth;

export type Permissions = {
  [K in keyof typeof ac.statements]?: (typeof ac.statements)[K][number][];
};
