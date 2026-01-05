import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/userSlice';
import Table from '@components/ui/Table';
import Select from '@components/ui/Select';
import Button from '@components/ui/Button';
import Icon from '@components/ui/Icon';
import Input from '@components/ui/Input';
import { useHRPayrollPage, useStaffPayslip } from './usePayrollPage';

function HRPayrollView() {
  const {
    year,
    month,
    departmentId,
    departments,
    rows,
    loading,
    totalNet,
    setYear,
    setMonth,
    setDepartmentId,
    handleExport,
  } = useHRPayrollPage();

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Payroll Management
      </h1>
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <Select
          label="Month"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          options={Array.from({ length: 12 }, (_, i) => {
            const m = i + 1;
            return { value: m, label: `${m}` };
          })}
          className="w-32"
        />

        <Select
          label="Year"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          options={Array.from({ length: 7 }, (_, i) => {
            const current = new Date().getFullYear();
            const y = current - 3 + i; // range: current-3 .. current+3
            return { value: y, label: `${y}` };
          })}
          className="w-32"
        />

        <Select
          label="Department"
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          options={[
            { value: '', label: 'All departments' },
            ...(Array.isArray(departments) ? departments : []).map((d) => ({
              value: d.id,
              label: d.name,
            })),
          ]}
          className="min-w-[200px]"
        />

        <Button
          variant="outline"
          className="ml-auto flex items-center gap-2"
          onClick={handleExport}
        >
          <span className="inline-flex items-center justify-center">
            <span className="w-5 h-5">
              <Icon name="file-spreadsheet" className="w-5 h-5" />
            </span>
          </span>
          <span>Export</span>
        </Button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Table
            columns={[
              {
                key: 'employee',
                label: 'Employee',
                render: (_cell, row) => (
                  <span className="font-medium text-secondary-900 dark:text-secondary-100">
                    {row.employee?.full_name}
                  </span>
                ),
              },
              {
                key: 'department',
                label: 'Department',
                render: (_cell, row) => (
                  <span className="text-secondary-700 dark:text-secondary-300">
                    {row.employee?.department?.name || row.employee?.department_name || '-'}
                  </span>
                ),
              },
              {
                key: 'totalHours',
                label: 'Hours',
                render: (_cell, row) => row.totals?.totalHours?.toFixed(2) ?? '0.00',
              },
              {
                key: 'baseSalary',
                label: 'Base salary',
                render: (_cell, row) => (row.contract?.salary ?? 0).toLocaleString(),
              },
              {
                key: 'hourlyRate',
                label: 'Hourly rate',
                render: (cell, row) => (row.hourlyRate ?? 0).toFixed(2),
              },
              {
                key: 'gross',
                label: 'Gross pay',
                render: (cell, row) => (row.gross ?? 0).toLocaleString(),
              },
              {
                key: 'lateMinutes',
                label: 'Late mins',
                render: (_cell, row) => row.totals?.lateMinutes ?? 0,
              },
              {
                key: 'absences',
                label: 'Absences',
                render: (_cell, row) => row.totals?.absentCount ?? 0,
              },
              {
                key: 'net',
                label: 'Net pay',
                render: (cell, row) => (
                  <span className="font-semibold text-secondary-900 dark:text-secondary-50">
                    {(row.net ?? 0).toLocaleString()}
                  </span>
                ),
              },
            ]}
            data={rows}
          />

          <div className="p-3 text-right font-bold text-secondary-900 dark:text-secondary-50 bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700">
            Total net pay: {totalNet.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

function StaffPayslipView() {
  const { year, month, data, loading, setYear, setMonth } = useStaffPayslip();

  if (loading || !data) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-700 dark:text-gray-200">
        <Icon name="loader" className="w-5 h-5 animate-spin" />
        <span>Loading payslip...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Payslip for {month}/{year}
      </h1>
      <div className="flex gap-3 mb-4">
        <Select
          label="Month"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          options={Array.from({ length: 12 }, (_, i) => {
            const m = i + 1;
            return { value: m, label: `${m}` };
          })}
          className="w-32"
        />

        <Input
          type="number"
          label="Year"
          className="w-28"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value) || year)}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded shadow p-6 text-gray-900 dark:text-gray-100">
        <div className="mb-3 font-semibold">
          {data.employee.full_name} ({data.employee.email})
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            Department: <span className="font-medium">{data.employee.department?.name || data.employee.department || '—'}</span>
          </div>
          <div>
            Base salary:{' '}
            <span className="font-medium">{(data.contract?.salary ?? 0).toLocaleString()}</span>
          </div>
          <div>
            Working hours:{' '}
            <span className="font-medium">{data.totals.totalHours.toFixed(2)} h</span>
          </div>
          <div>
            Hourly rate: <span className="font-medium">{data.hourlyRate.toFixed(2)}</span>
          </div>
          <div>
            Late: <span className="font-medium">{data.totals.lateMinutes} mins</span>
          </div>
          <div>
            Absent: <span className="font-medium">{data.totals.absentCount} shifts</span>
          </div>
          <div className="col-span-2 mt-2">
            Net pay:{' '}
            <span className="font-bold text-indigo-400 dark:text-indigo-300">
              {data.net.toLocaleString()} đ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PayrollPage() {
  const user = useSelector(selectUser);
  const role = user?.role;
  if (role === 'STAFF') return <StaffPayslipView />;
  return <HRPayrollView />;
}
