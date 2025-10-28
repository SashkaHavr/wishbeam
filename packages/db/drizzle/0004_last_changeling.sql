CREATE TYPE "public"."wishlist_status" AS ENUM('active', 'archived');--> statement-breakpoint
ALTER TABLE "wishlist_item" ADD COLUMN "status" "wishlist_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "wishlist_item" ADD COLUMN "estimated_price" text;