-- Add is_searchable
ALTER TABLE "user"
ADD "is_searchable" BOOLEAN NOT NULL DEFAULT false;
-- Check if this works on production deployment. Had issues today.
