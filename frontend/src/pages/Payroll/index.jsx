import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/userSlice';
import { payrollAPI } from '@/api/payrollAPI';
import { departmentAPI } from '@/api/departmentAPI';
import Table from '@components/ui/Table';
import Select from '@components/ui/Select';

function HRPayrollView() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const resp = await departmentAPI.getDepartments();
        console.log('Departments API response:', resp);
        // Normalize payload from backend: it may be { success, data: [...] } or { data: { items: [...] } }
        let list = [];
        if (Array.isArray(resp)) list = resp;
        else if (Array.isArray(resp?.data?.items)) list = resp.data.items; // <-- FIX: Check items first
        else if (Array.isArray(resp?.data)) list = resp.data;
        else if (Array.isArray(resp?.data?.data)) list = resp.data.data;
        else if (Array.isArray(resp?.records)) list = resp.records;
        else list = [];
        console.log('Normalized departments list:', list);
        setDepartments(list);
      } catch (e) {
        console.error('Error loading departments:', e);
        setDepartments([]);
      }
    })();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Convert departmentId to number or leave undefined
      const deptId = departmentId && departmentId !== '' ? parseInt(departmentId) : undefined;
      const resp = await payrollAPI.getMonthly(year, month, deptId);
      setRows(resp.data || resp || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [year, month, departmentId]);

  const totalNet = useMemo(() => rows.reduce((s, r) => s + (r.net || 0), 0), [rows]);

  const handleExport = async () => {
    const deptId = departmentId && departmentId !== '' ? parseInt(departmentId) : undefined;
    const blob = await payrollAPI.exportMonthly(year, month, deptId);
    const url = window.URL.createObjectURL(new Blob([blob]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payroll_${year}_${String(month).padStart(2, '0')}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Payroll Management</h1>
      <div className="flex flex-wrap gap-3 mb-4">
        <Select
          label="Month"
          value={month}
          onChange={(value) => setMonth(Number(value))}
          options={Array.from({ length: 12 }, (_, i) => {
            const m = i + 1;
            return { value: m, label: `${m}` };
          })}
          className="w-32"
        />

        <Select
          label="Year"
          value={year}
          onChange={(value) => setYear(Number(value))}
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
          onChange={(value) => setDepartmentId(value)}
          options={[
            { value: '', label: 'All departments' },
            ...(Array.isArray(departments) ? departments : []).map((d) => ({
              value: d.id,
              label: d.name,
            })),
          ]}
          className="min-w-[200px]"
        />
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
                    {row.employee?.department?.name || row.employee?.department_name || ''}
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
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [data, setData] = useState(null);

  useEffect(()=>{
    (async ()=>{
      const resp = await payrollAPI.getPayslip(year, month);
      setData(resp.data || resp);
    })();
  }, [year, month]);

  if (!data) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Payslip for {month}/{year}</h1>
      <div className="flex gap-3 mb-4">
        <select value={month} onChange={e=>setMonth(parseInt(e.target.value))} className="border rounded px-3 py-2">
          {Array.from({length:12}, (_,i)=>i+1).map(m=> <option key={m} value={m}>{m}</option>)}
        </select>
        <input type="number" className="border rounded px-3 py-2 w-24" value={year} onChange={e=>setYear(parseInt(e.target.value)||year)} />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded shadow p-6 text-gray-900 dark:text-gray-100">
        <div className="mb-3 font-semibold">{data.employee.full_name} ({data.employee.email})</div>
        <div className="grid grid-cols-2 gap-3">
          <div>Department: <span className="font-medium">{data.employee.department || '—'}</span></div>
          <div>Base salary: <span className="font-medium">{(data.contract?.salary ?? 0).toLocaleString()}</span></div>
          <div>Working hours: <span className="font-medium">{data.totals.totalHours.toFixed(2)} h</span></div>
          <div>Hourly rate: <span className="font-medium">{data.hourlyRate.toFixed(2)}</span></div>
          <div>Late: <span className="font-medium">{data.totals.lateMinutes} mins</span></div>
          <div>Absent: <span className="font-medium">{data.totals.absentCount} shifts</span></div>
          <div className="col-span-2 mt-2">Net pay: <span className="font-bold text-indigo-400 dark:text-indigo-300">{data.net.toLocaleString()} đ</span></div>
        </div>
      </div>
    </div>
  );
}

export default function PayrollPage() {
  const user = useSelector(selectUser);
  const role = user?.role;
  if (role === 'STAFF') return <StaffPayslipView/>;
  return <HRPayrollView/>;
}
