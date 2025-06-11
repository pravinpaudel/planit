/*
  Warnings:

  - You are about to drop the column `name` on the `milestones` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `tasks` table. All the data in the column will be lost.
  - Added the required column `title` to the `milestones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "milestones" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL;
