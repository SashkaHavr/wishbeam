import { createIsomorphicFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';

export const getWishlistShareUrl = createIsomorphicFn()
  .server((wishlistId: string) => {
    const request = getWebRequest();
    const url = new URL(request.url); // to ensure it's a valid URL
    return `${url.origin}/app/wishlists/${wishlistId}`;
  })
  .client((wishlistId: string) => {
    return `${window.location.origin}/app/wishlists/${wishlistId}`;
  });
