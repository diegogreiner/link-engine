/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `LinkAccess` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventId` to the `LinkAccess` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LinkAccess" ADD COLUMN     "eventId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LinkAccess_eventId_key" ON "LinkAccess"("eventId");
