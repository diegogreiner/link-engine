/*
  Warnings:

  - You are about to drop the `Click` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Click" DROP CONSTRAINT "Click_linkId_fkey";

-- DropTable
DROP TABLE "Click";
