-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('indefinite', 'fixed', 'probation', 'intern');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('draft', 'pending', 'active', 'expired');

-- DropIndex
DROP INDEX "departments_code_key";

-- DropIndex
DROP INDEX "employees_identity_number_key";

-- CreateTable
CREATE TABLE "contracts" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "contract_type" "ContractType" NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'draft',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "salary" DECIMAL(15,2),
    "work_location" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "employee_id" INTEGER NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contracts_code_key" ON "contracts"("code");

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
