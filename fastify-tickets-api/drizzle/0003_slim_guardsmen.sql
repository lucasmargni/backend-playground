CREATE TABLE "seat_holds" (
	"seat_id" uuid PRIMARY KEY NOT NULL,
	"reservation_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "seat_holds" ADD CONSTRAINT "seat_holds_seat_id_seats_id_fk" FOREIGN KEY ("seat_id") REFERENCES "public"."seats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seat_holds" ADD CONSTRAINT "seat_holds_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;