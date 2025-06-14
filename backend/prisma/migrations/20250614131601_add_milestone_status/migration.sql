/*
  Warnings:

  - You are about to drop the column `isComplete` on the `milestones` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'AT_RISK', 'DELAYED');

-- AlterTable
ALTER TABLE "milestones" DROP COLUMN "isComplete",
ADD COLUMN     "status" "MilestoneStatus" NOT NULL DEFAULT 'NOT_STARTED';
