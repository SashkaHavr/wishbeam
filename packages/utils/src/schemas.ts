import z from 'zod';

export const wishlistSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(800),
});
