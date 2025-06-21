/*
  Warnings:

  - A unique constraint covering the columns `[shareable_link]` on the table `tasks` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "original_task_id" TEXT,
ADD COLUMN     "shareable_link" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tasks_shareable_link_key" ON "tasks"("shareable_link");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_original_task_id_fkey" FOREIGN KEY ("original_task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
