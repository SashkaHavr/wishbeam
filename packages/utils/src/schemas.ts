import z from "zod";

export const wishlistSchema = z.object({
  title: z.string().nonempty().max(100),
  description: z.string().max(500),
});

export const wishlistItemSchema = z.object({
  title: z.string().nonempty().max(100),
  description: z.string().max(500),
  links: z.array(z.url()).max(5),
  estimatedPrice: z.string().max(50).nullable(),
});
