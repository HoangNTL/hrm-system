/*
  Warnings:

  - You are about to drop the column `manager_id` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `email_verified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[employee_id,date,shift_id]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_manager_id_fkey";

-- DropIndex
DROP INDEX "attendances_employee_id_date_key";

-- DropIndex
DROP INDEX "departments_manager_id_key";

-- AlterTable
ALTER TABLE "departments" DROP COLUMN "manager_id";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "email_verified",
DROP COLUMN "refresh_token";

-- CreateIndex
CREATE UNIQUE INDEX "attendances_employee_id_date_shift_id_key" ON "attendances"("employee_id", "date", "shift_id");
