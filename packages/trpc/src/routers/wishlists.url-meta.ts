import { TRPCError } from '@trpc/server';
import { redis } from 'bun';
import { parse } from 'node-html-parser';
import z from 'zod';

import { auth } from '@wishbeam/auth';
import { db } from '@wishbeam/db';

import { publicProcedure, router } from '#init.ts';
import { base62ToUuidv7, uuidv7ToBase62 } from '#utils/zod-utils.ts';

const hasher = new Bun.CryptoHasher('sha256');

async function fetchMetaImageUrl(url: string) {
  const urlHash = hasher.update(url).digest('base64');
  const redisKey = `url-meta:image:${urlHash}`;
  const cached = await redis.get(redisKey);
  if (cached) {
    return cached;
  }

  const html = await fetch(url);
  const htmlText = await html.text();
  const parsed = parse(htmlText);
  const metaImage = parsed.querySelector('meta[property="og:image"]');
  if (metaImage) {
    const imageUrl = metaImage.getAttribute('content');
    if (imageUrl) {
      await redis.set(redisKey, imageUrl);
      return imageUrl;
    }
  }
  const imageUrlFromImg = parsed.querySelector(
    'img[data-a-image-name="landingImage"]',
  );
  if (imageUrlFromImg) {
    const imgSrc = imageUrlFromImg.getAttribute('src');
    if (imgSrc) {
      await redis.set(redisKey, imgSrc);
      return imgSrc;
    }
  }
  return undefined;
}

export const urlMetaRouter = router({
  fetchMetaImage: publicProcedure
    .input(z.object({ wishlistItemId: base62ToUuidv7 }))
    .output(
      z.object({
        wishlistId: uuidv7ToBase62,
        link: z.url().optional(),
        imageUrl: z.url().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const session = await auth.api.getSession({
        headers: ctx.request.headers,
      });

      const wishlistItem = await db.query.wishlistItem.findFirst({
        columns: { id: true, links: true },
        where: {
          id: input.wishlistItemId,
          OR: [
            {
              wishlist: {
                OR: [
                  { shareStatus: 'public' },
                  session
                    ? {
                        shareStatus: 'shared',
                        wishlistSharedWith: { userId: session.user.id },
                      }
                    : {},
                ],
              },
            },
          ],
        },
      });
      if (!wishlistItem) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Wishlist item not found',
        });
      }
      const link = wishlistItem.links[0];
      if (!link) {
        return {
          wishlistId: wishlistItem.id,
          link: undefined,
          imageUrl: undefined,
        };
      }

      const imageUrl = await fetchMetaImageUrl(link);
      return { wishlistId: wishlistItem.id, link: link, imageUrl: imageUrl };
    }),
});
