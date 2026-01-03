import React from 'react';
import AdminHeader from './AdminHeader';
import SearchFilter from './SearchFilter';
import EmployeeList from './EmployeeList';
import { useAdminAttendance } from './useAdminAttendance';

export default function AdminAttendanceView() {
  const {
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
  } = useAdminAttendance();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <AdminHeader
          selectedDate={selectedDate}
          today={today}
          onDateChange={setSelectedDate}
          onTodayClick={() => setSelectedDate(today)}
        />

        {/* Search and Filter */}
        {records.length > 0 && (
          <SearchFilter
            searchText={searchText}
            onSearchChange={setSearchText}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            departments={departments}
          />
        )}

        {/* Employee List */}
        <EmployeeList
          loading={loading}
          employees={filteredEmployees}
          expandedEmployee={expandedEmployee}
          onToggleExpanded={(id) => setExpandedEmployee(expandedEmployee === id ? null : id)}
        />
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
   