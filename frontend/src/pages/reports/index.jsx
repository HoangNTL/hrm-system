import React, { useEffect, useState } from 'react';
import axios from '@/api/axios';

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const formatMillions = (value) => {
  const num = Number(value) || 0;
  const opts = num >= 10
    ? { maximumFractionDigits: 0 }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return `${num.toLocaleString(undefined, opts)} M`;
};

const formatMonthLabel = (value) => {
  if (!value) return '';
  const [y, m] = value.split('-').map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return '';
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

const parseSelectedMonth = (value) => {
  const [y, m] = (value || '').split('-').map(Number);
  if (Number.isFinite(y) && Number.isFinite(m) && m >= 1 && m <= 12) return { year: y, month: m };
  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() + 1 };
};

// Color palette for different items
const colorPalette = ['indigo', 'blue', 'cyan', 'teal', 'green', 'emerald', 'violet'];
const getBarColor = (index) => {
  const colors = {
    indigo: 'bg-indigo-500',
    blue: 'bg-blue-500',
    cyan: 'bg-cyan-500',
    teal: 'bg-teal-500',
    green: 'bg-green-500',
    emerald: 'bg-emerald-500',
    violet: 'bg-violet-500',
  };
  return colors[colorPalette[index % colorPalette.length]];
};

// Color based on percentage (red -> yellow -> green)
const getTrendBarColor = (percentage) => {
  if (percentage < 50) return 'bg-red-500';
  if (percentage < 75) return 'bg-yellow-500';
  return 'bg-green-500';
};

function BarRow({ label, value, display, max, colorIndex }) {
  const safeMax = max > 0 ? max : 1;
  const pct = Math.min(Math.max(((value || 0) / safeMax) * 100, 0), 100);
  const barColor = getBarColor(colorIndex);
  const shown = display ?? value;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-secondary-600 dark:text-secondary-300">
        <span>{label}</span>
        <span className="font-semibold text-secondary-900 dark:text-secondary-50">{shown}</span>
      </div>
      <div className="h-2 w-full bg-secondary-100 dark:bg-secondary-700 rounded overflow-hidden">
        <div
          className={`h-2 ${barColor} rounded`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ReportsPage() {
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

  useEffect(() => {
    (async () => {
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
        setError(err?.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedMonth]);

  const maxLate = lateByDept.length ? Math.max(...lateByDept.map((d) => d.late)) : 1;
  const maxPayroll = payrollByDept.length ? Math.max(...payrollByDept.map((d) => d.value)) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-secondary-900 dark:text-secondary-50">Reports</h1>
        <p className="text-secondary-600 dark:text-secondary-400 mt-2">Live data for HR/Admin</p>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700 text-rose-800 dark:text-rose-100 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((item) => (
          <div
            key={item.label}
            className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 shadow-sm"
          >
            <p className="text-sm text-secondary-500">{item.label}</p>
            <p className="text-2xl font-semibold text-secondary-900 dark:text-secondary-50 mt-1">{item.value}</p>
          </div>
        ))}
        {loading && kpis.length === 0 && (
          <div className="text-secondary-500">Loading...</div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-50">Attendance trend (last 7 days)</h2>
              <p className="text-sm text-secondary-500">On-time percentage</p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-48 w-full">
            {attendanceTrend.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full">
                <div className="flex-1 flex items-end w-full">
                  <div
                    className={`w-full ${getTrendBarColor(item.value)} rounded`}
                    style={{ height: `${item.value}%` }}
                  />
                </div>
                <span className="text-xs text-secondary-500 whitespace-nowrap">{item.label} ({item.value}%)</span>
              </div>
            ))}
            {attendanceTrend.length === 0 && (
              <div className="text-secondary-500 text-sm">No data</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-50">Late by department</h2>
              <p className="text-sm text-secondary-500">Count of late check-ins (30d)</p>
            </div>
          </div>
          <div className="space-y-3">
            {lateByDept.map((d, idx) => (
              <BarRow key={d.name} label={d.name} value={d.late} display={d.late} max={maxLate} colorIndex={idx} />
            ))}
            {lateByDept.length === 0 && (
              <div className="text-secondary-500 text-sm">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Payroll by department (compact) */}
      <div className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-50">Payroll by department</h2>
            <p className="text-sm text-secondary-500">Gross payroll by month</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-secondary-500">
            <label className="flex items-center gap-2">
              <span>Month</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-secondary-200 dark:border-secondary-600 rounded px-2 py-1 text-sm bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </label>
            <span>Unit: million VND</span>
          </div>
        </div>
        <div className="space-y-3 max-w-2xl mx-auto w-full">
          {payrollByDept.map((d, idx) => (
            <BarRow
              key={d.name}
              label={d.name}
              value={d.value}
              display={formatMillions(d.value)}
              max={maxPayroll}
              colorIndex={idx}
            />
          ))}
          {payrollByDept.length === 0 && (
            <div className="text-secondary-500 text-sm">No data</div>
          )}
        </div>
      </div>

    </div>
  );
}
