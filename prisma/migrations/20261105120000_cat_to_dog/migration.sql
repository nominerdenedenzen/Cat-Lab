-- 🟢 NEW MIGRATION (cat → dog)
-- Rename the label values in the database so they match schema.prisma.
ALTER TYPE "Label" RENAME VALUE 'CAT' TO 'DOG';
ALTER TYPE "Label" RENAME VALUE 'NOT_CAT' TO 'NOT_DOG';

-- Old "cat" labels don't mean anything for dogs (a photo labeled CAT would
-- otherwise suddenly become DOG), so clear them. You will re-label in Step 2.
-- Your uploaded photos are NOT deleted.
UPDATE "photo" SET "label" = NULL;
