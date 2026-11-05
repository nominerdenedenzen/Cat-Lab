-- CreateEnum
CREATE TYPE "Label" AS ENUM ('CAT', 'NOT_CAT');

-- CreateEnum
CREATE TYPE "Ground" AS ENUM ('training', 'testing');

-- CreateTable
CREATE TABLE "photo" (
    "id" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "label" "Label",
    "ground" "Ground" DEFAULT 'training',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "photo_storagePath_key" ON "photo"("storagePath");
