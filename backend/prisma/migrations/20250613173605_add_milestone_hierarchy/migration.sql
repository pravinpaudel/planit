-- AlterTable
ALTER TABLE "milestones" ADD COLUMN     "parent_id" TEXT;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "milestones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
