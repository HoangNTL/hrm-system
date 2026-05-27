CREATE INDEX "users_is_deleted_idx" ON "users"("is_deleted");

CREATE INDEX "employees_is_deleted_idx" ON "employees"("is_deleted");
CREATE INDEX "employees_department_id_is_deleted_idx" ON "employees"("department_id", "is_deleted");

CREATE INDEX "contracts_employee_id_status_is_deleted_idx" ON "contracts"("employee_id", "status", "is_deleted");

CREATE INDEX "attendances_employee_id_date_is_deleted_idx" ON "attendances"("employee_id", "date", "is_deleted");
CREATE INDEX "attendances_status_date_is_deleted_idx" ON "attendances"("status", "date", "is_deleted");

CREATE INDEX "attendance_requests_employee_id_is_deleted_idx" ON "attendance_requests"("employee_id", "is_deleted");
CREATE INDEX "attendance_requests_status_requested_date_is_deleted_idx" ON "attendance_requests"("status", "requested_date", "is_deleted");
CREATE INDEX "attendance_requests_requested_date_idx" ON "attendance_requests"("requested_date");
