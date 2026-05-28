import { useCallback, useEffect, useMemo, useState } from 'react';
import { payrollAPI } from '../api/payroll.api';
import { departmentAPI } from '@/features/departments/api/department.api';

export function useHRPayrollPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [departmentId, setDepartmentId] = useState('');
  const [search, setSearch] = useState('');
  const [departments, setDepartments] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
  });

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
      const resp = await payrollAPI.getMonthly({
        year,
        month,
        departmentId: deptId,
        search: search.trim(),
        page: pagination.page,
        limit: pagination.limit,
      });
      setRows(resp.data || []);
      setPagination((prev) => ({
        ...prev,
        total: resp.pagination?.total || 0,
        totalPages: resp.pagination?.total_pages || 1,
      }));
    } finally {
      setLoading(false);
    }
  }, [year, month, departmentId, search, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalNet = useMemo(
    () => rows.reduce((s, r) => s + (r.net || 0), 0),
    [rows],
  );

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleExport = useCallback(async () => {
    const deptId = departmentId && departmentId !== '' ? parseInt(departmentId) : undefined;
    const blob = await payrollAPI.exportMonthly(year, month, deptId, search.trim());
    const url = window.URL.createObjectURL(new Blob([blob]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payroll_${year}_${String(month).padStart(2, '0')}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }, [year, month, departmentId, search]);

  return {
    // state
    year,
    month,
    departmentId,
    search,
    departments,
    rows,
    loading,
    totalNet,
    pagination,

    // setters / handlers
    setYear: (value) => {
      setYear(value);
      setPagination((prev) => ({ ...prev, page: 1 }));
    },
    setMonth: (value) => {
      setMonth(value);
      setPagination((prev) => ({ ...prev, page: 1 }));
    },
    setDepartmentId: (value) => {
      setDepartmentId(value);
      setPagination((prev) => ({ ...prev, page: 1 }));
    },
    fetchData,
    handleSearchChange,
    handlePageChange,
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
