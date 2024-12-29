CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION generate_nanoid(size int DEFAULT 21)
RETURNS text AS $$
DECLARE
	id text := '';
	i int := 0;
	bytes bytea;
	alphabet text := '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	alphabet_length int := length(alphabet);
BEGIN
	bytes := gen_random_bytes(size);
	WHILE i < size LOOP
		id := id || substr(alphabet, (get_byte(bytes, i) % alphabet_length) + 1, 1);
		i := i + 1;
	END LOOP;
	RETURN id;
END;
$$ LANGUAGE plpgsql VOLATILE;
--> statement-breakpoint
		CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" char(12) DEFAULT generate_nanoid(12) NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" char(12) PRIMARY KEY DEFAULT generate_nanoid(12) NOT NULL,
	"name" text,
	"email" text,
	"password_hash" text
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;