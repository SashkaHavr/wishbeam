import { useEffect, useLayoutEffect } from "react";
import { isServer } from "@tanstack/react-query";

export const useIsomorphicLayoutEffect = isServer ? useEffect : useLayoutEffect;
