/*
  Warnings:

  - You are about to drop the column `published` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `publicUrl` on the `PostImage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[postId,position]` on the table `PostImage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `direction` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `PostImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `PostImage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SplitDirection" AS ENUM ('horizontal', 'vertical');

-- CreateEnum
CREATE TYPE "ScoreLocation" AS ENUM ('top-left', 'top-right', 'bottom-left', 'bottom-right');

-- CreateEnum
CREATE TYPE "PostVisibility" AS ENUM ('public', 'hidden');

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "published",
DROP COLUMN "title",
ADD COLUMN     "direction" "SplitDirection" NOT NULL,
ADD COLUMN     "visibility" "PostVisibility" NOT NULL DEFAULT 'public';

-- AlterTable
ALTER TABLE "PostImage" DROP COLUMN "publicUrl",
ADD COLUMN     "position" INTEGER NOT NULL,
ADD COLUMN     "publicId" TEXT NOT NULL,
ADD COLUMN     "scoreColor" TEXT NOT NULL DEFAULT '#ffffff',
ADD COLUMN     "scoreLocation" "ScoreLocation" NOT NULL DEFAULT 'top-right';

-- CreateTable
CREATE TABLE "PostMergedImage" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "secureUrl" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "PostMergedImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageRating" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImageRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostMergedImage_publicId_key" ON "PostMergedImage"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "PostMergedImage_postId_key" ON "PostMergedImage"("postId");

-- CreateIndex
CREATE INDEX "ImageRating_imageId_idx" ON "ImageRating"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "ImageRating_userId_imageId_key" ON "ImageRating"("userId", "imageId");

-- CreateIndex
CREATE UNIQUE INDEX "PostImage_postId_position_key" ON "PostImage"("postId", "position");

-- AddForeignKey
ALTER TABLE "PostMergedImage" ADD CONSTRAINT "PostMergedImage_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageRating" ADD CONSTRAINT "ImageRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageRating" ADD CONSTRAINT "ImageRating_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "PostImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
