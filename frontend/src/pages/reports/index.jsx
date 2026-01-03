import React from 'react';

import KpiCards from './KpiCards';
import AttendanceTrendChart from './AttendanceTrendChart';
import DepartmentChart from './DepartmentChart';
import PayrollByDeptChart from './PayrollByDeptChart';
import { useReportsPage } from './useReportsPage';

export default function ReportsPage() {
  const {
    // state
    loading,
    error,
    kpis,
    lateByDept,
    payrollByDept,
    attendanceTrend,
    selectedMonth,
    maxLate,
    maxPayroll,

    // handlers
    handleMonthChange,
  } = useReportsPage();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-secondary-900 dark:text-secondary-50">
          Reports
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400 mt-2">
          Live data for HR/Admin
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700 text-rose-800 dark:text-rose-100 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <KpiCards kpis={kpis} loading={loading} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AttendanceTrendChart data={attendanceTrend} />
        <DepartmentChart
          title="Late by department"
          description="Count of late check-ins (30d)"
          data={lateByDept}
          maxValue={maxLate}
          type="count"
        />
      </div>

      {/* Payroll by Department */}
      <PayrollByDeptChart
        data={payrollByDept}
        maxValue={maxPayroll}
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
      />
    </div>
  );
}
