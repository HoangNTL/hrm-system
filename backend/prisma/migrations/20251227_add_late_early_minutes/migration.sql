-- AlterTable
ALTER TABLE "attendances" ADD COLUMN "late_minutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "early_minutes" INTEGER NOT NULL DEFAULT 0;
