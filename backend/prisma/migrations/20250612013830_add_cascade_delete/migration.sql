-- DropForeignKey
ALTER TABLE "milestones" DROP CONSTRAINT "milestones_task_id_fkey";

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
