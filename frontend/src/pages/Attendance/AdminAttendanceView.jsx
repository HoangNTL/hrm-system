import React, { useState, useEffect, useCallback } from 'react';
import axios from '@/api/axios';
import { Loader, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminAttendanceView() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [editModal, setEditModal] = useState({ isOpen: false, record: null, checkIn: '', checkOut: '', notes: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, recordId: null, employeeName: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const fetchRecordsByDate = useCallback(async () => {
    try {
      setLoading(true);
      
      // Gửi date string thuần (YYYY-MM-DD) để tránh lỗi timezone offset
      // Backend sẽ filter theo trường 'date' (date type) chính xác
      console.log('📅 Fetching attendance for:', selectedDate);

      const response = await axios.get('/attendance', {
        params: {
          fromDate: selectedDate,
          toDate: selectedDate,
          page: 1,
          limit: 200
        }
      });

      console.log('📊 Full response:', response.data);

      // Chuẩn hoá dữ liệu từ API (các khả năng phổ biến)
      let rows = [];
      const payload = response.data;
      const d = payload?.data;

      if (Array.isArray(d)) {
        rows = d;
      } else if (d && Array.isArray(d.data)) {
        // Trường hợp controller trả về { data: { data: attendances, total, ... } }
        rows = d.data;
      } else if (d && Array.isArray(d.records)) {
        rows = d.records;
      } else if (Array.isArray(payload)) {
        rows = payload;
      } else {
        rows = [];
      }

      // Chuẩn hoá mỗi bản ghi để luôn có thông tin employee tối thiểu
      const normalized = rows.map((r) => {
        const empId = r?.employee?.id ?? r?.employee_id ?? r?.employeeId ?? null;
        const fullName = r?.employee?.full_name || r?.full_name || r?.employee_name || (empId ? `Employee #${empId}` : 'Unknown');
        const email = r?.employee?.email || r?.email || '';
        const deptName = r?.employee?.department?.department_name || r?.employee?.department?.name || r?.department?.name || r?.department_name || null;

        const employee = r?.employee && r.employee.id ? r.employee : {
          id: empId,
          full_name: fullName,
          email,
          department: deptName ? { name: deptName, department_name: deptName } : null,
        };

        const status = r?.status === 'present' ? 'on-time' : (r?.status || 'on-time');

        return {
          ...r,
          employee,
          status,
        };
      });

      console.log('✅ Normalized records:', normalized);
      setRecords(normalized);
    } catch (error) {
      console.error('❌ Error fetching records:', error);
      console.error('Error details:', error.response?.data);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchRecordsByDate();
  }, [fetchRecordsByDate]);

  const formatDateTime = (date) => {
    if (!date) return '--:--';
    const d = new Date(date);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(11, 16);
  };

  // Đã bỏ hàm chuyển đổi cho input datetime vì không còn dùng trong UI

  const groupByEmployee = () => {
    const grouped = {};
    const recordsArray = Array.isArray(records) ? records : [];
    recordsArray.forEach(record => {
      const empId = record?.employee?.id ?? record?.employee_id ?? record?.employeeId;
      if (!empId) return; // Bỏ qua bản ghi lỗi

      const englishName = record?.employee?.full_name || record?.full_name || `Employee #${empId}`;
      const email = record?.employee?.email || record?.email || '';
      const deptName = record?.employee?.department?.department_name || record?.employee?.department?.name || record?.department?.name || null;

      if (!grouped[empId]) {
        grouped[empId] = {
          employee: {
            id: empId,
            full_name: englishName,
            email,
            department: deptName ? { name: deptName, department_name: deptName } : null,
          },
          records: [],
          totalHours: 0,
          lateCount: 0,
          status: 'on-time'
        };
      }
      grouped[empId].records.push(record);
      grouped[empId].totalHours += parseFloat(record.work_hours) || 0;
      if (record.status === 'late') grouped[empId].lateCount += 1;
      if (record.status === 'late' || record.status === 'absent') {
        grouped[empId].status = record.status;
      }
    });
    return Object.values(grouped).sort((a, b) => 
      a.employee.full_name.localeCompare(b.employee.full_name)
    );
  };

  // Đã bỏ tính năng sửa bản ghi để đơn giản UI

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      const response = await axios.put(`/attendance/${editModal.record.id}`, {
        check_in: editModal.checkIn ? new Date(editModal.checkIn).toISOString() : null,
        check_out: editModal.checkOut ? new Date(editModal.checkOut).toISOString() : null,
        notes: editModal.notes
      });

      if (response.data.success) {
        setEditModal({ isOpen: false, record: null, checkIn: '', checkOut: '', notes: '' });
        fetchRecordsByDate();
        alert('Update successful');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // Đã bỏ tính năng xóa bản ghi để đơn giản UI

  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      const response = await axios.delete(`/attendance/${deleteConfirm.recordId}`);

      if (response.data.success) {
        setDeleteConfirm({ isOpen: false, recordId: null, employeeName: '' });
        fetchRecordsByDate();
        alert('Deleted successfully');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const allEmployees = groupByEmployee();
  const today = new Date().toISOString().slice(0, 10);

  // Lấy danh sách phòng ban duy nhất
  const departments = Array.from(new Set(
    allEmployees
      .map(emp => emp.employee.department?.name || emp.employee.department?.department_name || 'N/A')
      .filter(Boolean)
  )).sort();

  // Lọc nhân viên theo tìm kiếm và phòng ban
  const filteredEmployees = allEmployees.filter(emp => {
    const matchesSearch = emp.employee.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
                          emp.employee.email.toLowerCase().includes(searchText.toLowerCase());
    const empDept = emp.employee.department?.name || emp.employee.department?.department_name || 'N/A';
    const matchesDept = !selectedDepartment || empDept === selectedDepartment;
    return matchesSearch && matchesDept;
  });
  const employees = filteredEmployees;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Attendance management</h1>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedDate !== today && (
              <button
                onClick={() => setSelectedDate(today)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        {records.length > 0 && (
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <input
              type="text"
              placeholder="Search employees (name or email)..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:min-w-[200px]"
            >
              <option value="">All departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-600">
            <Loader className="w-6 h-6 animate-spin mr-2" /> Loading...
          </div>
        ) : employees.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-600">
            No attendance data for this day
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header row for list columns */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="w-full px-4 py-3 flex items-center gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                <div className="flex-shrink-0 w-5" />
                <div className="flex-1">Employee</div>
                <div className="min-w-[150px]">Department</div>
                <div className="min-w-[80px] text-center">Shifts</div>
                <div className="min-w-[80px] text-center">Hours</div>
                <div className="min-w-[120px]">Status</div>
              </div>
            </div>
            {employees.map(group => (
              <div key={group.employee.id} className="bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden hover:border-blue-300 transition">
                {/* Employee Row */}
                <button
                  onClick={() => setExpandedEmployee(
                    expandedEmployee === group.employee.id ? null : group.employee.id
                  )}
                  className="w-full px-4 py-2.5 flex items-center gap-4 hover:bg-blue-50 transition"
                >
                  <div className="flex-shrink-0">
                    {expandedEmployee === group.employee.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </div>

                  {/* Employee Info */}
                  <div className="flex-1 text-left">
                    <h3 className="text-base font-semibold text-gray-900">{group.employee.full_name}</h3>
                    <p className="text-xs text-gray-500">{group.employee.email}</p>
                  </div>

                  {/* Department */}
                  <div className="text-sm text-gray-600 min-w-[150px]">
                    {group.employee.department?.name || group.employee.department?.department_name || 'N/A'}
                  </div>

                  {/* Shift count */}
                  <div className="text-sm font-semibold text-gray-800 min-w-[80px] text-center">
                    {group.records.length} shifts
                  </div>

                  {/* Total hours */}
                  <div className="text-sm font-semibold text-blue-600 min-w-[80px] text-center">
                    {group.totalHours.toFixed(1)}h
                  </div>

                  {/* Status badge */}
                  <div className="min-w-[120px]">
                    {group.status === 'late' && (
                      <span className="inline-block px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold rounded-full">
                        Late {group.lateCount}
                      </span>
                    )}
                    {group.status === 'absent' && (
                      <span className="inline-block px-3 py-1 bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold rounded-full">
                        Absent
                      </span>
                    )}
                    {group.status === 'on-time' && (
                      <span className="inline-block px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-full">
                        On time
                      </span>
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedEmployee === group.employee.id && (
                  <div className="bg-blue-50 border-t-2 border-blue-200 px-4 py-3 space-y-3">
                    {/* Shift Details Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-300 text-gray-600 font-semibold">
                            <th className="text-left py-2 px-2">Shift</th>
                            <th className="text-center py-2 px-2">Check-in</th>
                            <th className="text-center py-2 px-2">Check-out</th>
                            <th className="text-center py-2 px-2">Hours</th>
                            <th className="text-center py-2 px-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.records.map(record => (
                            <tr key={record.id} className="border-b border-gray-200 hover:bg-white transition">
                              <td className="py-3 px-2 font-semibold text-gray-800">
                                {record.shift?.shift_name || 'Shift'}
                              </td>
                              <td className="py-3 px-2 text-center font-mono text-green-600">
                                {formatDateTime(record.check_in)}
                              </td>
                              <td className="py-3 px-2 text-center font-mono text-orange-600">
                                {formatDateTime(record.check_out) || '--:--'}
                              </td>
                              <td className="py-3 px-2 text-center font-semibold text-blue-600">
                                {parseFloat(record.work_hours).toFixed(2)}h
                              </td>
                              <td className="py-3 px-2 text-center">
                                {record.status === 'late' && (
                                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                                    Late
                                  </span>
                                )}
                                {record.status === 'absent' && (
                                  <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                    Absent
                                  </span>
                                )}
                                {record.status === 'on-time' && (
                                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                    On time
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit attendance</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Check-in</label>
                <input
                  type="datetime-local"
                  value={editModal.checkIn}
                  onChange={(e) => setEditModal({ ...editModal, checkIn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Check-out</label>
                <input
                  type="datetime-local"
                  value={editModal.checkOut}
                  onChange={(e) => setEditModal({ ...editModal, checkOut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editModal.notes}
                  onChange={(e) => setEditModal({ ...editModal, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditModal({ isOpen: false, record: null, checkIn: '', checkOut: '', notes: '' })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the attendance record for {deleteConfirm.employeeName}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, recordId: null, employeeName: '' })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
