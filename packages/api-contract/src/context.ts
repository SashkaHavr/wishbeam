import { Context } from "effect";

import type { SessionType } from "@wishbeam/auth";
import type { IdBranded } from "@wishbeam/db/id-branded";

export class CurrentUser extends Context.Service<
  CurrentUser,
  {
    readonly session: SessionType;
    readonly userId: IdBranded<"user">;
  }
>()("api/CurrentUser") {}
