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
    const raw = typeof timeObj === 'string' ? timeObj : timeObj.toString();

    // ISO UTC (kết thúc bằng 'Z') -> cộng +7 giờ (VN không có DST)
    if (raw.includes('T') && /Z$/.test(raw)) {
      const d = new Date(raw);
      const pad = (n) => String(n).padStart(2, '0');
      const hoursVN = (d.getUTCHours() + 7) % 24;
      const minutes = d.getUTCMinutes();
      return `${pad(hoursVN)}:${pad(minutes)}`;
    }

    // Fallback: chuỗi "HH:MM:SS" hoặc "HH:MM"
    if (/^\d{2}:\d{2}/.test(raw)) {
      return raw.slice(0, 5);
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
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, pages: 0 });
  const [searchName, setSearchName] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchRecords();
  }, [pagination.page]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    // Lấy danh sách phòng ban từ records
    const depts = [...new Set(records
      .flatMap(r => r.employee?.department?.name)
      .filter(d => d)
    )];
    setDepartments(depts);
  }, [records]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/departments');
      console.log('Departments response:', response.data); // Debug
      if (response.data.success || response.data.ok) {
        const items = response.data.data?.items || response.data.data || [];
        const deptNames = items
          .map(d => d.name || d.dept_name)
          .filter(n => n && n.trim());
        console.log('Extracted departments:', deptNames); // Debug
        setDepartments(deptNames);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

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

  // Group records by employee
  const groupByEmployee = () => {
    const grouped = {};
    records.forEach(record => {
      const empId = record.employee.id;
      if (!grouped[empId]) {
        grouped[empId] = {
          employee: record.employee,
          records: [],
          totalHours: 0,
          totalDays: 0
        };
      }
      grouped[empId].records.push(record);
      grouped[empId].totalHours += parseFloat(record.work_hours) || 0;
      grouped[empId].totalDays += 1;
    });
    const groups = Object.values(grouped);
    console.log('Employee groups with departments:', groups.map(g => ({ 
      name: g.employee.full_name, 
      dept: g.employee.department 
    }))); // Debug
    return groups;
  };

  // Apply filters
  const filterAndSearch = (groups) => {
    return groups.filter(group => {
      // Lọc theo tên
      if (searchName && !group.employee.full_name.toLowerCase().includes(searchName.toLowerCase())) {
        return false;
      }
      // Lọc theo phòng ban
      if (filterDepartment) {
        const empDeptName = group.employee.department?.name || '';
        console.log('Comparing:', empDeptName, 'with', filterDepartment, 'Equal:', empDeptName === filterDepartment); // Debug
        if (empDeptName !== filterDepartment) {
          return false;
        }
      }
      // Lọc theo ngày
      if (filterDateFrom || filterDateTo) {
        const hasRecordInRange = group.records.some(r => {
          const recordDate = new Date(r.date);
          const fromDate = filterDateFrom ? new Date(filterDateFrom) : new Date('1970-01-01');
          const toDate = filterDateTo ? new Date(filterDateTo) : new Date('2099-12-31');
          return recordDate >= fromDate && recordDate <= toDate;
        });
        if (!hasRecordInRange) return false;
      }
      return true;
    });
  };

  let employeeGroups = groupByEmployee();
  employeeGroups = filterAndSearch(employeeGroups);

  // Pagination
  const startIdx = (pagination.page - 1) * pagination.pageSize;
  const endIdx = startIdx + pagination.pageSize;
  const paginatedGroups = employeeGroups.slice(startIdx, endIdx);
  const totalPages = Math.ceil(employeeGroups.length / pagination.pageSize);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Danh sách chấm công</h1>

        {/* Search & Filter Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search by name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tìm kiếm theo tên</label>
              <input
                type="text"
                placeholder="Nhập tên nhân viên..."
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value);
                  setPagination(p => ({ ...p, page: 1 }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date from */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Từ ngày</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => {
                  setFilterDateFrom(e.target.value);
                  setPagination(p => ({ ...p, page: 1 }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date to */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Đến ngày</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => {
                  setFilterDateTo(e.target.value);
                  setPagination(p => ({ ...p, page: 1 }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Department filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phòng ban</label>
              <select
                value={filterDepartment}
                onChange={(e) => {
                  setFilterDepartment(e.target.value);
                  setPagination(p => ({ ...p, page: 1 }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Tất cả phòng ban --</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset button */}
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchName('');
                setFilterDateFrom('');
                setFilterDateTo('');
                setFilterDepartment('');
                setPagination(p => ({ ...p, page: 1 }));
              }}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-12 h-12 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="space-y-0">
                {paginatedGroups.map((group) => {
                  return (
                    <details key={`emp-${group.employee.id}`} className="border-b bg-blue-50 hover:bg-blue-100 transition">
                      {/* Summary Row - Employee Level */}
                      <summary className="px-6 py-4 flex items-center justify-between font-semibold text-gray-800 select-none cursor-pointer">
                        <div className="flex items-center gap-6 flex-1">
                          <div className="w-40">
                            <div className="text-gray-900 font-semibold">{group.employee.full_name}</div>
                            <div className="text-xs text-gray-500">{group.employee.email}</div>
                          </div>
                          <div className="w-24 text-center text-gray-700">{group.totalDays} ca</div>
                          <div className="w-32 text-center font-bold text-blue-600">{group.totalHours.toFixed(1)}h</div>
                        </div>
                        <span className="text-gray-400 text-lg">▶</span>
                      </summary>

                      {/* Expanded Content - All Records for This Employee */}
                      <div className="px-6 py-4 bg-white border-t border-gray-200">
                        <div className="space-y-4">
                          {group.records.map(record => (
                            <div key={record.id} className="pb-4 border-b border-gray-200 last:border-b-0">
                              <div className="grid grid-cols-5 gap-4 text-sm">
                                <div>
                                  <div className="text-xs text-gray-500 mb-1">Ngày</div>
                                  <div className="font-semibold text-gray-900">{formatDate(record.date)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500 mb-1">Ca làm việc</div>
                                  <div className="font-semibold text-gray-900">{record.shift?.shift_name || '—'}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500 mb-1">Check-in</div>
                                  <div className="font-mono text-green-700 font-semibold">{formatDateTime(record.check_in) || '—'}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500 mb-1">Check-out</div>
                                  <div className="font-mono text-orange-700 font-semibold">{formatDateTime(record.check_out) || '—'}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500 mb-1">Giờ làm</div>
                                  <div className="font-semibold text-blue-600">{(parseFloat(record.work_hours) || 0).toFixed(2)}h</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>

            {employeeGroups.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Không có dữ liệu chấm công
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  ← Trước
                </button>
                <span className="px-4 py-2">
                  {pagination.page} / {totalPages}
                </span>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: Math.min(totalPages, p.page + 1) }))}
                  disabled={pagination.page === totalPages}
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
