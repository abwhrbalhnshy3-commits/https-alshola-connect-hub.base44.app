-- Add typed reactions while keeping existing likes as the default reaction.
ALTER TABLE "Like"
ADD COLUMN "type" TEXT NOT NULL DEFAULT 'like';

ALTER TABLE "Like"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "Like_postId_type_idx" ON "Like"("postId", "type");
