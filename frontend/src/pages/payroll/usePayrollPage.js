import { useCallback, useEffect, useMemo, useState } from 'react';
import { payrollAPI } from '@/api/payrollAPI';
import { departmentAPI } from '@/api/departmentAPI';

export function useHRPayrollPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load departments once
  useEffect(() => {
    (async () => {
      try {
        const resp = await departmentAPI.getDepartments();
        let list = [];
        if (Array.isArray(resp)) list = resp;
        else if (Array.isArray(resp?.data?.items)) list = resp.data.items;
        else if (Array.isArray(resp?.data)) list = resp.data;
        else if (Array.isArray(resp?.data?.data)) list = resp.data.data;
        else if (Array.isArray(resp?.records)) list = resp.records;
        else list = [];
        setDepartments(list);
      } catch (e) {
        console.error('Error loading departments:', e);
        setDepartments([]);
      }
    })();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const deptId = departmentId && departmentId !== '' ? parseInt(departmentId) : undefined;
      const resp = await payrollAPI.getMonthly(year, month, deptId);
      setRows(resp.data || resp || []);
    } finally {
      setLoading(false);
    }
  }, [year, month, departmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalNet = useMemo(
    () => rows.reduce((s, r) => s + (r.net || 0), 0),
    [rows],
  );

  const handleExport = useCallback(async () => {
    const deptId = departmentId && departmentId !== '' ? parseInt(departmentId) : undefined;
    const blob = await payrollAPI.exportMonthly(year, month, deptId);
    const url = window.URL.createObjectURL(new Blob([blob]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payroll_${year}_${String(month).padStart(2, '0')}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }, [year, month, departmentId]);

  return {
    // state
    year,
    month,
    departmentId,
    departments,
    rows,
    loading,
    totalNet,

    // setters / handlers
    setYear,
    setMonth,
    setDepartmentId,
    fetchData,
    handleExport,
  };
}

export function useStaffPayslip() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPayslip = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await payrollAPI.getPayslip(year, month);
      setData(resp.data || resp);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchPayslip();
  }, [fetchPayslip]);

  return {
    year,
    month,
    data,
    loading,
    setYear,
    setMonth,
  };
}
