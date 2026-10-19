import { HttpRouter } from "effect/http";

import { App } from "@wishbeam/api/src/app.ts";

export const api = HttpRouter.toWebHandler(App, { disableLogger: true });
