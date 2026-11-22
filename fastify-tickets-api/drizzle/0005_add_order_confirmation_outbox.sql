CREATE TABLE "order_confirmation_outbox" (
	"order_id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"enqueued_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "order_confirmation_outbox" ADD CONSTRAINT "order_confirmation_outbox_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_confirmation_outbox_pending_created_at_idx" ON "order_confirmation_outbox" USING btree ("created_at") WHERE "order_confirmation_outbox"."enqueued_at" IS NULL;