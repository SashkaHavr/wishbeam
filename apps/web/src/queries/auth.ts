import { useMutation } from "@tanstack/react-query";

import { getAuthClient } from "~/lib/auth";

export function useGoogleSignIn(googleEmulate: boolean) {
  return useMutation({
    mutationFn: async () => {
      const callbackURL = window.location.href;
      if (googleEmulate) {
        await getAuthClient().signIn.social({ provider: "google-emulate", callbackURL });
      } else {
        await getAuthClient().signIn.social({ provider: "google", callbackURL });
      }
    },
  });
}
