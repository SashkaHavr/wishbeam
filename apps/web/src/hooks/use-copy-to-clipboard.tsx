import { isServer } from "@tanstack/react-query";
import { useState } from "react";

export function useCopyToClipboard({
  timeout = 2000,
  onCopy,
}: {
  timeout?: number;
  onCopy?: () => void;
} = {}) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = (value: string) => {
    if (isServer || !value) {
      return;
    }

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);

      if (onCopy) {
        onCopy();
      }

      if (timeout !== 0) {
        setTimeout(() => {
          setIsCopied(false);
        }, timeout);
      }
    }, console.error);
  };

  return { isCopied, copyToClipboard };
}
