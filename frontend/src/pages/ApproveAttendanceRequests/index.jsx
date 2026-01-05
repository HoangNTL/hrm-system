import React from 'react';
import RequestList from './RequestList';
import PaginationBase from '@components/ui/Pagination';
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
            Approve attendance correction requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            There are {total} requests pending approval
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
        {totalPages > 1 && (
          <div className="mt-6">
            <PaginationBase
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

