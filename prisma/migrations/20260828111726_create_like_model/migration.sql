/*
  Warnings:

  - You are about to drop the column `likesCount` on the `Build` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Build` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Build" DROP COLUMN "likesCount",
DROP COLUMN "rating";

-- CreateTable
CREATE TABLE "BuildLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,

    CONSTRAINT "BuildLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BuildLike_userId_buildId_key" ON "BuildLike"("userId", "buildId");

-- AddForeignKey
ALTER TABLE "BuildLike" ADD CONSTRAINT "BuildLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildLike" ADD CONSTRAINT "BuildLike_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Build"("id") ON DELETE CASCADE ON UPDATE CASCADE;
