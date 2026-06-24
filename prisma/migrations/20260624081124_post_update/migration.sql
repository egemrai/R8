/*
  Warnings:

  - You are about to drop the column `url` on the `PostImage` table. All the data in the column will be lost.
  - Added the required column `publicUrl` to the `PostImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secureUrl` to the `PostImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostImage" DROP COLUMN "url",
ADD COLUMN     "publicUrl" TEXT NOT NULL,
ADD COLUMN     "secureUrl" TEXT NOT NULL;
