/*
  Warnings:

  - You are about to drop the column `checkIn` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `checkOut` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `workingHours` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `hireDate` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `identityNumber` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `positionId` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `workStatus` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[employee_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `employee_id` to the `attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `departments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `employees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `employees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `positions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_positionId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_employeeId_fkey";

-- DropIndex
DROP INDEX "users_employeeId_key";

-- AlterTable
ALTER TABLE "attendances" DROP COLUMN "checkIn",
DROP COLUMN "checkOut",
DROP COLUMN "employeeId",
DROP COLUMN "workingHours",
ADD COLUMN     "check_in" TIMESTAMP(3),
ADD COLUMN     "check_out" TIMESTAMP(3),
ADD COLUMN     "employee_id" INTEGER NOT NULL,
ADD COLUMN     "working_hours" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "departments" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "employees" DROP COLUMN "createdAt",
DROP COLUMN "departmentId",
DROP COLUMN "fullName",
DROP COLUMN "hireDate",
DROP COLUMN "identityNumber",
DROP COLUMN "positionId",
DROP COLUMN "updatedAt",
DROP COLUMN "workStatus",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "department_id" INTEGER,
ADD COLUMN     "full_name" TEXT NOT NULL,
ADD COLUMN     "hire_date" TIMESTAMP(3),
ADD COLUMN     "identity_number" TEXT,
ADD COLUMN     "position_id" INTEGER,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "work_status" TEXT NOT NULL DEFAULT 'working';

-- AlterTable
ALTER TABLE "positions" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "employeeId",
DROP COLUMN "passwordHash",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "employee_id" INTEGER,
ADD COLUMN     "password_hash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_id_key" ON "users"("employee_id");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
