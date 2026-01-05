import React from 'react';
import AdminHeader from './AdminHeader';
import SearchFilter from './SearchFilter';
import EmployeeList from './EmployeeList';
import { useAdminAttendance } from './useAdminAttendance';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';

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
      <Modal
        isOpen={editModal.isOpen}
        onClose={() =>
          setEditModal({ isOpen: false, record: null, checkIn: '', checkOut: '', notes: '' })
        }
        title="Edit attendance"
        size="md"
      >
        <div className="space-y-4">
          <Input
            type="datetime-local"
            name="checkIn"
            label="Check-in"
            value={editModal.checkIn}
            onChange={(e) =>
              setEditModal({ ...editModal, checkIn: e.target.value })
            }
          />
          <Input
            type="datetime-local"
            name="checkOut"
            label="Check-out"
            value={editModal.checkOut}
            onChange={(e) =>
              setEditModal({ ...editModal, checkOut: e.target.value })
            }
          />
          <Textarea
            name="notes"
            label="Notes"
            rows={3}
            value={editModal.notes}
            onChange={(e) =>
              setEditModal({ ...editModal, notes: e.target.value })
            }
          />
        </div>
        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() =>
              setEditModal({
                isOpen: false,
                record: null,
                checkIn: '',
                checkOut: '',
                notes: '',
              })
            }
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleSaveEdit}
            loading={loading}
          >
            Save
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, recordId: null, employeeName: '' })
        }
        title="Confirm delete"
        size="md"
      >
        <p className="text-gray-600 dark:text-secondary-200 mb-6">
          Are you sure you want to delete the attendance record for{' '}
          <span className="font-semibold">{deleteConfirm.employeeName}</span>?
        </p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() =>
              setDeleteConfirm({
                isOpen: false,
                recordId: null,
                employeeName: '',
              })
            }
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            onClick={handleConfirmDelete}
            loading={deleteLoading}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
