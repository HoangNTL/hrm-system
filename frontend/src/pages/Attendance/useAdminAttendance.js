import { useState, useEffect, useCallback } from 'react';
import axios from '@/api/axios';

export function useAdminAttendance() {
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

      // Normalize data from API
      let rows = [];
      const payload = response.data;
      const d = payload?.data;

      if (Array.isArray(d)) {
        rows = d;
      } else if (d && Array.isArray(d.data)) {
        rows = d.data;
      } else if (d && Array.isArray(d.records)) {
        rows = d.records;
      } else if (Array.isArray(payload)) {
        rows = payload;
      } else {
        rows = [];
      }

      // Normalize each record
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

  const groupByEmployee = () => {
    const grouped = {};
    const recordsArray = Array.isArray(records) ? records : [];
    recordsArray.forEach(record => {
      const empId = record?.employee?.id ?? record?.employee_id ?? record?.employeeId;
      if (!empId) return;

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

  // Get unique departments
  const departments = Array.from(new Set(
    allEmployees
      .map(emp => emp.employee.department?.name || emp.employee.department?.department_name || 'N/A')
      .filter(Boolean)
  )).sort();

  // Filter employees by search and department
  const filteredEmployees = allEmployees.filter(emp => {
    const matchesSearch = emp.employee.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
                          emp.employee.email.toLowerCase().includes(searchText.toLowerCase());
    const empDept = emp.employee.department?.name || emp.employee.department?.department_name || 'N/A';
    const matchesDept = !selectedDepartment || empDept === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  return {
    // State
    selectedDate,
    records,
    loading,
    expandedEmployee,
    editModal,
    deleteConfirm,
    deleteLoading,
    searchText,
    selectedDepartment,
    today,
    departments,
    filteredEmployees,

    // Setters
    setSelectedDate,
    setExpandedEmployee,
    setEditModal,
    setDeleteConfirm,
    setSearchText,
    setSelectedDepartment,

    // Handlers
    handleSaveEdit,
    handleConfirmDelete,
  };
}
