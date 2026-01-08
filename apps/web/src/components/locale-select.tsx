import type { Locale } from "use-intl";

import { useRouteContext, useRouter } from "@tanstack/react-router";

import { isLocale, localeCookieName, locales } from "@wishbeam/intl";
import { setClientCookie } from "~/utils/cookie";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const localeToText: Record<Locale, string> = {
  en: "English",
};

export function LocaleSelect({ className }: { className?: string }) {
  const locale = useRouteContext({
    from: "__root__",
    select: (s) => s.intl.locale,
  });
  const router = useRouter();
  return (
    <Select
      value={locale}
      onValueChange={(e) => {
        if (isLocale(e)) {
          setClientCookie(localeCookieName, e);
          void router.invalidate();
        }
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue>{localeToText[locale]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {locales.map((l) => {
            return (
              <SelectItem key={l} value={l}>
                {localeToText[l]}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
