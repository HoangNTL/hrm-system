import React from 'react';
import RequestList from './RequestList';
import Pagination from './Pagination';
import { useApproveAttendanceRequests } from './useApproveAttendanceRequests';

export default function ApproveAttendanceRequestsPage() {
  const {
    // State
    requests,
    loading,
    expandedId,
    page,
    total,
    totalPages,
    actionLoading,
    notes,

    // Handlers
    toggleExpanded,
    handlePageChange,
    handleApprove,
    handleReject,
    updateNotes,
  } = useApproveAttendanceRequests();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Duyệt đơn xin sửa chấm công
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Có {total} đơn chờ duyệt
          </p>
        </div>

        {/* Requests List */}
        <RequestList
          requests={requests}
          loading={loading}
          expandedId={expandedId}
          actionLoading={actionLoading}
          notes={notes}
          onToggleExpanded={toggleExpanded}
          onUpdateNotes={updateNotes}
          onApprove={handleApprove}
          onReject={handleReject}
        />

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </div>
  );
}

