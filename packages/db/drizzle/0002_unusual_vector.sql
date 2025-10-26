CREATE TABLE "wishlist_public_users_saved_share" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"wishlist_id" uuid NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wishlist_item" ADD COLUMN "locked_user_id" uuid;--> statement-breakpoint
ALTER TABLE "wishlist_public_users_saved_share" ADD CONSTRAINT "wishlist_public_users_saved_share_wishlist_id_wishlist_id_fk" FOREIGN KEY ("wishlist_id") REFERENCES "public"."wishlist"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_public_users_saved_share" ADD CONSTRAINT "wishlist_public_users_saved_share_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "wishlist_public_users_saved_share_wishlist_id_index" ON "wishlist_public_users_saved_share" USING btree ("wishlist_id");--> statement-breakpoint
CREATE INDEX "wishlist_public_users_saved_share_user_id_index" ON "wishlist_public_users_saved_share" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "wishlist_item" ADD CONSTRAINT "wishlist_item_locked_user_id_user_id_fk" FOREIGN KEY ("locked_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;