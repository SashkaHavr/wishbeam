ALTER TABLE "account" ALTER COLUMN "account_id" SET DATA TYPE text;--> statement-breakpoint
CREATE INDEX "session_token_index" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "user_email_index" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "verification_identifier_index" ON "verification" USING btree ("identifier");