-- Add the pseudonymous identifier before application rollout.
ALTER TABLE "LinkAccess" ADD COLUMN "ipHash" TEXT;

-- Existing raw IPs are intentionally erased. This operation is irreversible.
UPDATE "LinkAccess" SET "ip" = NULL WHERE "ip" IS NOT NULL;

-- Keep the legacy column temporarily for expand/contract compatibility, but
-- ensure old application instances cannot persist new raw values during rollout.
CREATE OR REPLACE FUNCTION "redact_link_access_ip"()
RETURNS trigger AS $$
BEGIN
  NEW."ip" := NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "LinkAccess_redact_ip"
BEFORE INSERT OR UPDATE OF "ip" ON "LinkAccess"
FOR EACH ROW
EXECUTE FUNCTION "redact_link_access_ip"();
