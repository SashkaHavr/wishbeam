import { auth } from "@wishbeam/auth";
import { db } from "@wishbeam/db";

export function createContext({ request }: { request: Request }) {
  return { request, db, auth: auth.api };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
