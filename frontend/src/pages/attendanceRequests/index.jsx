import React from 'react';
import Icon from '@components/ui/Icon';
import Button from '@components/ui/Button';
import EditAttendanceModal from '@/components/EditAttendanceModal';
import StatusFilter from './StatusFilter';
import RequestList from './RequestList';
import Pagination from '@components/ui/Pagination';
import { useAttendanceRequests } from './useAttendanceRequests';

export default function AttendanceRequestsPage() {
  const {
    // State
    requests,
    loading,
    expandedId,
    statusFilter,
    page,
    totalPages,
    modalOpen,
    selectedAttendance,

    // Handlers
    toggleExpanded,
    handleFilterChange,
    handlePageChange,
    openModal,
    closeModal,
    fetchRequests,
  } = useAttendanceRequests();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Attendance correction requests
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Manage your attendance correction requests.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => openModal()}
            className="flex items-center gap-2"
          >
            <Icon name="plus" className="w-5 h-5" />
            <span>New request</span>
          </Button>
        </div>

        {/* Filter */}
        <StatusFilter statusFilter={statusFilter} onFilterChange={handleFilterChange} />

        {/* Requests List */}
        <RequestList
          requests={requests}
          loading={loading}
          expandedId={expandedId}
          onToggleExpanded={toggleExpanded}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={requests.length}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      <EditAttendanceModal
        isOpen={modalOpen}
        onClose={closeModal}
        attendanceRecord={selectedAttendance}
        onSuccess={fetchRequests}
      />
    </div>
  );
}

