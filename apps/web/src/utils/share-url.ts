import type { LinkProps } from '@tanstack/react-router';
import { createIsomorphicFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';

const route = '/shared/$id' satisfies LinkProps['to'];

export const getWishlistShareUrl = createIsomorphicFn()
  .server((wishlistId: string) => {
    const request = getWebRequest();
    const url = new URL(request.url); // to ensure it's a valid URL
    return `${url.origin}${route.replace('$id', wishlistId)}`;
  })
  .client((wishlistId: string) => {
    return `${window.location.origin}${route.replace('$id', wishlistId)}`;
  });
