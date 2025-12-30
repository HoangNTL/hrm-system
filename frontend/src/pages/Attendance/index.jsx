import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/userSlice';
import axios from '@/api/axios';
import { Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import AdminAttendanceView from './AdminAttendanceView';

export default function AttendancePage() {
  const user = useSelector(selectUser);
  const userRole = user?.role;

  // STAFF: Check-in/Check-out form
  if (userRole === 'STAFF') {
    return <StaffAttendanceView />;
  }

  // ADMIN/HR: Attendance records list
  return <AdminAttendanceView />;
}

// STAFF VIEW - Check-in/Check-out
function StaffAttendanceView() {
  const user = useSelector(selectUser);
  const [attendance, setAttendance] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [monthlyData, setMonthlyData] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [selectedShiftId, setSelectedShiftId] = useState(null);

  const employeeId = user?.employee_id;

  // Fetch shifts list
  const fetchShifts = useCallback(async () => {
    try {
      const response = await axios.get(`/attendance/shifts`);
      if (response.data.success) {
        console.log('Shifts from API:', response.data.data);
        setShifts(response.data.data);
        if (response.data.data.length > 0 && !selectedShiftId) {
          setSelectedShiftId(response.data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  }, [selectedShiftId]);

  // Fetch today's attendance status
  const fetchTodayStatus = useCallback(async (shiftIdParam) => {
    try {
      const response = await axios.get(`/attendance/today`, {
        params: shiftIdParam ? { shiftId: shiftIdParam } : {}
      });
      if (response.data.success) {
        setAttendance(response.data.data.attendance);
        setShift(response.data.data.shift);
        if (!shiftIdParam && response.data.data.shift?.id) {
          setSelectedShiftId(response.data.data.shift.id);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  }, []);

  // Fetch monthly hours
  const fetchMonthlyHours = useCallback(async () => {
    try {
      const now = new Date();
      const response = await axios.get(
        `/attendance/monthly?year=${now.getFullYear()}&month=${now.getMonth() + 1}`
      );
      if (response.data.success) {
        setMonthlyData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    }
  }, []);

  // Load shifts on mount
  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // Load today status when employee ID available
  useEffect(() => {
    if (!employeeId || !selectedShiftId) return;
    fetchTodayStatus(selectedShiftId);
  }, [employeeId, selectedShiftId, fetchTodayStatus]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load monthly hours when employee ID available
  useEffect(() => {
    if (!employeeId) return;
    fetchMonthlyHours();
  }, [employeeId, fetchMonthlyHours]);

  // Auto-clear message after timeout
  useEffect(() => {
    if (!message) return;
    const timeoutMs = status === 'error' ? 6000 : 3000;
    const timer = setTimeout(() => setMessage(''), timeoutMs);
    return () => clearTimeout(timer);
  }, [message, status]);

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      setMessage('');

      if (!selectedShiftId) {
        setMessage('Please select a shift');
        setStatus('error');
        setLoading(false);
        return;
      }

      console.log('Check-in request:', { employeeId, shiftId: selectedShiftId });

      const response = await axios.post('/attendance/check-in', {
        employeeId,
        shiftId: selectedShiftId
      });

      if (response.data.success) {
        setMessage(response.data.message);
        setStatus('success');
        fetchTodayStatus(selectedShiftId);
      }
    } catch (error) {
      console.error('Check-in error details:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Check-in failed';
      setMessage(errorMsg);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      setMessage('');

      if (!selectedShiftId) {
        setMessage('Please select a shift');
        setStatus('error');
        setLoading(false);
        return;
      }

      const response = await axios.post('/attendance/check-out', {
        employeeId,
        shiftId: selectedShiftId
      });

      console.log('Check-out response:', response.data);

      if (response.data.success) {
        setMessage(response.data.message);
        setStatus('success');
        fetchTodayStatus(selectedShiftId);
      } else {
        setMessage(response.data.message || 'Lỗi check-out');
        setStatus('error');
      }
    } catch (error) {
      console.error('Check-out error details:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || 'Check-out failed';
      console.log('Setting error message:', errorMsg);
      setMessage(errorMsg);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return '--:--';
    return new Date(date).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getShiftTime = (timeObj) => {
    if (!timeObj) return '--:--';
    const raw = typeof timeObj === 'string' ? timeObj : timeObj.toString();

    // ISO UTC (ends with 'Z') -> add +7 hours (VN has no DST)
    if (raw.includes('T') && /Z$/.test(raw)) {
      const d = new Date(raw);
      const pad = (n) => String(n).padStart(2, '0');
      const hoursVN = (d.getUTCHours() + 7) % 24;
      const minutes = d.getUTCMinutes();
      return `${pad(hoursVN)}:${pad(minutes)}`;
    }

    // Fallback: "HH:MM:SS" or "HH:MM" string
    if (/^\d{2}:\d{2}/.test(raw)) {
      return raw.slice(0, 5);
    }

    return '--:--';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8 text-gray-900 dark:text-gray-100">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Attendance</h1>
          <p className="text-gray-600">{formatDate(new Date())}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-blue-500" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">Current time</p>
          </div>
          <div className="text-center">
            <p className="text-6xl font-bold text-blue-600 font-mono">
              {formatTime(currentTime)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Work shift</h2>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Choose shift:</label>
            <select
              value={selectedShiftId || ''}
              onChange={(e) => setSelectedShiftId(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select shift --</option>
              {shifts.map(s => (
                <option key={s.id} value={s.id}>
                  {s.shift_name} ({getShiftTime(s.start_time)} - {getShiftTime(s.end_time)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {(() => {
              const currentShift = shifts.find(s => s.id === selectedShiftId) || shift;
              return (
                <>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Shift</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{currentShift?.shift_name || '—'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Start</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {getShiftTime(currentShift?.start_time)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">End</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {getShiftTime(currentShift?.end_time)}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Today</h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border-2 border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">Check-in</p>
              {attendance?.check_in ? (
                <>
                  <p className="text-2xl font-bold text-green-600">
                    {formatTime(attendance.check_in)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {attendance.status === 'late' ? '⚠️ Late' : '✅ On time'}
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-gray-400">--:--</p>
              )}
            </div>

            <div className="border-2 border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">Check-out</p>
              {attendance?.check_out ? (
                <>
                  <p className="text-2xl font-bold text-green-600">
                    {formatTime(attendance.check_out)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    ✅ {attendance.work_hours}h
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-gray-400">--:--</p>
              )}
            </div>
          </div>

          {message && (
            <div className="mb-6 p-4 rounded-lg flex items-start gap-3" 
              style={{
                backgroundColor: status === 'success' ? '#ecfdf5' : '#fef2f2',
                border: status === 'success' ? '1px solid #10b981' : '1px solid #ef4444'
              }}>
              {status === 'success' && <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />}
              {status === 'error' && <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />}
              <p style={{
                color: status === 'success' ? '#059669' : '#dc2626'
              }} className="font-medium flex-1">
                {message}
              </p>
              <button 
                onClick={() => setMessage('')}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleCheckIn}
              disabled={!selectedShiftId || !!attendance?.check_in || loading}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                !selectedShiftId || !!attendance?.check_in || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                </span>
              ) : (
                '📍 CHECK-IN'
              )}
            </button>

            <button
              onClick={handleCheckOut}
              disabled={!selectedShiftId || !attendance?.check_in || !!attendance?.check_out || loading}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                !selectedShiftId || !attendance?.check_in || !!attendance?.check_out || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                </span>
              ) : (
                '🚪 CHECK-OUT'
              )}
            </button>
          </div>
        </div>

        {monthlyData && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Total hours in {monthlyData.month}/{monthlyData.year}
            </h2>
            <div className="text-center">
              <p className="text-5xl font-bold text-indigo-600 mb-2">
                {monthlyData.totalHours}
              </p>
              <p className="text-gray-600">
                {monthlyData.attendanceCount} attended days
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
