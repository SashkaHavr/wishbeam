import { isServer } from "@tanstack/react-query";
import { useEffect, useLayoutEffect } from "react";

export const useIsomorphicLayoutEffect = isServer ? useEffect : useLayoutEffect;
