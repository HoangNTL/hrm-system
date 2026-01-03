import React from 'react';
import { Plus } from 'lucide-react';
import EditAttendanceModal from '@/components/EditAttendanceModal';
import StatusFilter from './StatusFilter';
import RequestList from './RequestList';
import Pagination from './Pagination';
import { useAttendanceRequests } from './useAttendanceRequests';

export default function MyAttendanceRequestsPage() {
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
              Các đơn xin sửa chấm công
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Quản lý các đơn xin sửa chấm công của bạn
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            <Plus className="w-5 h-5" />
            Gửi đơn mới
          </button>
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
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
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

