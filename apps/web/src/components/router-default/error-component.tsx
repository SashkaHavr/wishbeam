import { ErrorComponent as DefaultErrorComponent } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { Predicate } from "effect";

import { m } from "@wishbeam/intl/messages";
import { logError } from "~/utils/log";

import { LinkButton } from "../ui/button";
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { NotFoundComponent } from "./not-found-component";

export function ErrorComponent({ error }: ErrorComponentProps) {
  if (Predicate.isTagged(error, "WishlistNotFound")) return <NotFoundComponent />;
  logError(error);

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="default">
          {import.meta.env.DEV && <DefaultErrorComponent error={error} />}
        </EmptyMedia>
        <EmptyTitle>{m.routeDefault_error()}</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <LinkButton to="/">{m.routeDefault_returnToHomePage()}</LinkButton>
        </div>
      </EmptyContent>
    </Empty>
  );
}
