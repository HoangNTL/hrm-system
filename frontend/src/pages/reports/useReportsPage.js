import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from '@/api/axios';
import toast from 'react-hot-toast';

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const parseSelectedMonth = (value) => {
  const [y, m] = (value || '').split('-').map(Number);
  if (Number.isFinite(y) && Number.isFinite(m) && m >= 1 && m <= 12) return { year: y, month: m };
  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() + 1 };
};

const formatMonthLabel = (value) => {
  if (!value) return '';
  const [y, m] = value.split('-').map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return '';
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

/**
 * Hook quản lý toàn bộ state + logic cho trang Reports
 */
export function useReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kpis, setKpis] = useState([]);
  const [lateByDept, setLateByDept] = useState([]);
  const [payrollByDept, setPayrollByDept] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const maxLate = useMemo(
    () => (lateByDept.length ? Math.max(...lateByDept.map((d) => d.late)) : 1),
    [lateByDept]
  );

  const maxPayroll = useMemo(
    () => (payrollByDept.length ? Math.max(...payrollByDept.map((d) => d.value)) : 1),
    [payrollByDept]
  );

  const handleMonthChange = useCallback((e) => {
    setSelectedMonth(e.target.value);
  }, []);

  const fetchReportsData = useCallback(async () => {
    try {
      setError('');
      setLoading(true);

      const to = new Date();
      const from = daysAgo(30);
      const { year: payrollYear, month: payrollMonth } = parseSelectedMonth(selectedMonth);
      const monthLabel = formatMonthLabel(selectedMonth) || 'This month';
      const params = {
        fromDate: from.toISOString(),
        toDate: to.toISOString(),
        page: 1,
        limit: 1000,
      };

      const [attResp, payrollResp, empResp] = await Promise.all([
        axios.get('/attendance', { params }),
        axios.get('/payroll/monthly', { params: { year: payrollYear, month: payrollMonth } }),
        axios.get('/employees', { params: { page: 1, limit: 1 } }),
      ]);

      console.log('API Responses:', {
        attendance: attResp.data,
        payroll: payrollResp.data,
        employees: empResp.data
      });

      const normalizeArr = (payload) => {
        if (Array.isArray(payload?.data?.data)) return payload.data.data;
        if (Array.isArray(payload?.data?.items)) return payload.data.items;
        if (Array.isArray(payload?.data)) return payload.data;
        if (Array.isArray(payload?.records)) return payload.records;
        if (Array.isArray(payload)) return payload;
        return [];
      };

      const attRows = normalizeArr(attResp.data) ?? [];
      const payrollRows = normalizeArr(payrollResp.data) ?? [];

      console.log('Normalized data:', {
        attCount: attRows.length,
        payrollCount: payrollRows.length,
        attSample: attRows.slice(0, 2),
        payrollSample: payrollRows.slice(0, 2)
      });

      // Employees total (try pagination total, fallback to length)
      const empPayload = empResp?.data ?? {};
      const empTotal = empPayload?.pagination?.total
        ?? empPayload?.data?.pagination?.total
        ?? empPayload?.total
        ?? (Array.isArray(empPayload?.data) ? empPayload.data.length : 0)
        ?? (Array.isArray(empPayload) ? empPayload.length : 0)
        ?? 0;

      const totalAtt = attRows.length || 1;
      const lateCount = attRows.filter((r) => r.status === 'late').length;
      const absentCount = attRows.filter((r) => r.status === 'absent').length;
      const onTimeRate = Math.max(0, Math.round(((totalAtt - lateCount - absentCount) / totalAtt) * 100));

      // Late by department
      const lateMap = {};
      attRows.forEach((r) => {
        if (r.status === 'late') {
          const dept = r?.employee?.department?.name
            || r?.employee?.department?.department_name
            || r?.department?.name
            || 'N/A';
          lateMap[dept] = (lateMap[dept] || 0) + 1;
        }
      });
      const lateByDeptArr = Object.entries(lateMap).map(([name, late]) => ({ name, late }));

      console.log('Late by dept:', { lateMap, lateByDeptArr });

      // Payroll by department (million VND)
      const payrollMap = {};
      payrollRows.forEach((p) => {
        const dept = p?.employee?.department?.name
          || p?.employee?.department
          || p?.employee?.department_name
          || p?.department?.name
          || p?.department_name
          || 'N/A';
        const net = Number(p?.net) || 0;
        payrollMap[dept] = (payrollMap[dept] || 0) + net;
      });
      const payrollByDeptArr = Object.entries(payrollMap).map(([name, value]) => ({
        name,
        value: value / 1_000_000,
      }));

      const payrollTotal = payrollRows.reduce((s, r) => s + (Number(r?.net) || 0), 0);

      // Attendance trend (last 7 days on-time rate)
      const byDate = {};
      attRows.forEach((r) => {
        const key = (r.date || r.check_in || r.check_out || '')?.toString().slice(0, 10);
        if (!key) return;
        if (!byDate[key]) byDate[key] = { total: 0, ok: 0 };
        byDate[key].total += 1;
        if (r.status !== 'late' && r.status !== 'absent') byDate[key].ok += 1;
      });
      const dates = Object.keys(byDate).sort().slice(-7);
      const trend = dates.map((d) => {
        const { total, ok } = byDate[d];
        const rate = total ? Math.round((ok / total) * 100) : 0;
        return { label: d.slice(5), value: rate };
      });

      console.log('Trend calculation:', { byDate, dates, trend });

      const formatMillions = (value) => {
        const num = Number(value) || 0;
        const opts = num >= 10
          ? { maximumFractionDigits: 0 }
          : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
        return `${num.toLocaleString(undefined, opts)} M`;
      };

      setKpis([
        { label: 'Total employees', value: empTotal || 0 },
        { label: 'On-time rate (30d)', value: `${onTimeRate}%` },
        { label: 'Late count (30d)', value: lateCount },
        { label: `Payroll (${monthLabel})`, value: `${formatMillions(payrollTotal / 1_000_000)} VND` },
      ]);
      setLateByDept(lateByDeptArr);
      setPayrollByDept(payrollByDeptArr);
      setAttendanceTrend(trend);
    } catch (err) {
      console.error('Reports load error', err);
      const errorMessage = err?.message || 'Failed to load reports';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  return {
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
  };
}
