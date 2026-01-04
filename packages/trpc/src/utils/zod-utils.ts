import basex from "base-x";
import { parse as uuidParse, stringify as uuidStringify } from "uuid";
import z from "zod";

const base62 = basex("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");

export const uuidv7ToBase62 = z.uuidv7().transform((uuid) => base62.encode(uuidParse(uuid)));
export const base62ToUuidv7 = z
  .string()
  .min(16)
  .max(22)
  .transform((str) => uuidStringify(base62.decode(str)));
