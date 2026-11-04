ALTER TABLE "seats" DROP CONSTRAINT "seats_event_id_label_unique";--> statement-breakpoint
ALTER TABLE "seats" ADD COLUMN "row" text NOT NULL;--> statement-breakpoint
ALTER TABLE "seats" ADD COLUMN "number" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "seats" DROP COLUMN "label";--> statement-breakpoint
ALTER TABLE "seats" ADD CONSTRAINT "seats_event_id_row_number_unique" UNIQUE("event_id","row","number");--> statement-breakpoint
ALTER TABLE "seats" ADD CONSTRAINT "seats_number_positive" CHECK ("seats"."number" > 0);