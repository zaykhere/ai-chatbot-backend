ALTER TABLE "chatbots" ADD COLUMN "api_key" text;--> statement-breakpoint
ALTER TABLE "chatbots" ADD CONSTRAINT "chatbots_api_key_unique" UNIQUE("api_key");