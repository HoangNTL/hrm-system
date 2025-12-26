import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/userSlice';
import axios from '@/api/axios';
import { Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';

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

  // Luôn tải danh sách ca để chọn, không phụ thuộc employeeId
  useEffect(() => {
    fetchShifts();
  }, []);

  // Chỉ tải trạng thái hôm nay khi có employeeId
  useEffect(() => {
    if (!employeeId || !selectedShiftId) return;
    fetchTodayStatus(selectedShiftId);
  }, [employeeId, selectedShiftId]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!employeeId) return;
    fetchMonthlyHours();
  }, [employeeId]);

  useEffect(() => {
    if (!message) return;
    const timeoutMs = status === 'error' ? 6000 : 3000;
    const timer = setTimeout(() => setMessage(''), timeoutMs);
    return () => clearTimeout(timer);
  }, [message, status]);

  const fetchTodayStatus = async (shiftIdParam) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const fetchShifts = async () => {
    try {
      const response = await axios.get(`/attendance/shifts`);
      if (response.data.success) {
        console.log('Shifts from API:', response.data.data); // Debug
        setShifts(response.data.data);
        if (response.data.data.length > 0 && !selectedShiftId) {
          setSelectedShiftId(response.data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };

  const fetchMonthlyHours = async () => {
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
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      setMessage('');

      if (!selectedShiftId) {
        setMessage('Vui lòng chọn ca làm việc');
        setStatus('error');
        setLoading(false);
        return;
      }

      console.log('Check-in request:', { employeeId, shiftId: selectedShiftId }); // Debug

      const response = await axios.post('/attendance/check-in', {
        employeeId,
        shiftId: selectedShiftId
      });

      if (response.data.success) {
        setMessage(response.data.message);
        setStatus('success');
        fetchTodayStatus();
      }
    } catch (error) {
      console.error('Check-in error details:', error.response?.data); // Debug chi tiết
      const errorMsg = error.response?.data?.message || 'Lỗi check-in';
      setMessage(errorMsg);
      setStatus('error');
      // Không tự động clear error message, để user tự dismiss
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      setMessage('');

      if (!selectedShiftId) {
        setMessage('Vui lòng chọn ca làm việc');
        setStatus('error');
        setLoading(false);
        return;
      }

      const response = await axios.post('/attendance/check-out', {
        employeeId,
        shiftId: selectedShiftId
      });

      console.log('Check-out response:', response.data); // Debug

      if (response.data.success) {
        setMessage(response.data.message);
        setStatus('success');
        fetchTodayStatus();
      } else {
        // Nếu success = false
        setMessage(response.data.message || 'Lỗi check-out');
        setStatus('error');
      }
    } catch (error) {
      console.error('Check-out error details:', error.response?.data); // Debug chi tiết
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi check-out';
      console.log('Setting error message:', errorMsg); // Debug
      setMessage(errorMsg);
      setStatus('error');
      // Không tự động clear error message, để user tự dismiss
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return '--:--';
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getShiftTime = (timeObj) => {
    if (!timeObj) return '--:--';
    
    // Convert to string nếu cần
    const timeStr = typeof timeObj === 'string' ? timeObj : timeObj.toString();
    
    // Trường hợp: ISO string như "1970-01-01T15:00:00.000Z" - chỉ lấy phần giờ
    if (timeStr.includes('T')) {
      const timePart = timeStr.split('T')[1]; // "15:00:00.000Z"
      return timePart.split(':').slice(0, 2).join(':'); // "15:00"
    }
    
    // Trường hợp: "HH:MM:SS" hoặc "HH:MM"
    if (timeStr.match(/^\d{2}:\d{2}/)) {
      return timeStr.slice(0, 5);
    }
    
    return '--:--';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Chấm Công</h1>
          <p className="text-gray-600">{formatDate(new Date())}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-blue-500" />
            <p className="text-gray-600 font-medium">Thời gian hiện tại</p>
          </div>
          <div className="text-center">
            <p className="text-6xl font-bold text-blue-600 font-mono">
              {formatTime(currentTime)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ca làm việc</h2>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">Chọn ca:</label>
            <select
              value={selectedShiftId || ''}
              onChange={(e) => setSelectedShiftId(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn ca --</option>
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
                    <p className="text-sm text-gray-500 mb-1">Tên ca</p>
                    <p className="text-lg font-semibold text-gray-800">{currentShift?.shift_name || '—'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Vào làm</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {getShiftTime(currentShift?.start_time)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Tan ca</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {getShiftTime(currentShift?.end_time)}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Trạng thái hôm nay</h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border-2 border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">Check-in</p>
              {attendance?.check_in ? (
                <>
                  <p className="text-2xl font-bold text-green-600">
                    {formatTime(attendance.check_in)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {attendance.status === 'late' ? '⚠️ Đi trễ' : '✅ Đúng giờ'}
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
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Tổng giờ làm việc tháng {monthlyData.month}/{monthlyData.year}
            </h2>
            <div className="text-center">
              <p className="text-5xl font-bold text-indigo-600 mb-2">
                {monthlyData.totalHours}
              </p>
              <p className="text-gray-600">
                Tổng {monthlyData.attendanceCount} ngày đã chấm công
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ADMIN/HR VIEW - Attendance Records
function AdminAttendanceView() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchRecords();
  }, [pagination.page]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/attendance', {
        params: {
          page: pagination.page,
          limit: pagination.pageSize
        }
      });
      if (response.data.success) {
        setRecords(response.data.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.total,
          pages: response.data.data.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return '--:--';
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    if (!date) return '--';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Danh sách chấm công</h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-12 h-12 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Nhân viên</th>
                    <th className="px-4 py-3 text-left font-semibold">Ngày</th>
                    <th className="px-4 py-3 text-left font-semibold">Check-in</th>
                    <th className="px-4 py-3 text-left font-semibold">Check-out</th>
                    <th className="px-4 py-3 text-left font-semibold">Giờ làm</th>
                    <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(record => (
                    <tr key={record.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{record.employee.full_name}</td>
                      <td className="px-4 py-3">{formatDate(record.date)}</td>
                      <td className="px-4 py-3">{formatDateTime(record.check_in) || '--'}</td>
                      <td className="px-4 py-3">{formatDateTime(record.check_out) || '--'}</td>
                      <td className="px-4 py-3">{record.work_hours || '--'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          record.status === 'present' ? 'bg-green-100 text-green-800' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {records.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Không có dữ liệu chấm công
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  ← Trước
                </button>
                <span className="px-4 py-2">
                  {pagination.page} / {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
