CREATE TABLE "chatbot_domains" (
	"id" serial PRIMARY KEY NOT NULL,
	"chatbot_id" integer NOT NULL,
	"domain" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chatbot_domains" ADD CONSTRAINT "chatbot_domains_chatbot_id_chatbots_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbots"("id") ON DELETE no action ON UPDATE no action;