import React from 'react';
import Icon from '@components/ui/Icon';
import Button from '@components/ui/Button';
import Textarea from '@components/ui/Textarea';
import { getRequestTypeLabel, formatDateTime } from './RequestUtils';

export default function RequestList({
  requests,
  loading,
  expandedId,
  actionLoading,
  notes,
  onToggleExpanded,
  onUpdateNotes,
  onApprove,
  onReject,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="loader" className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          There are no requests pending approval.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div
          key={request.id}
          className={`rounded-lg border-2 overflow-hidden transition ${
            expandedId === request.id
              ? 'border-blue-400 shadow-md'
              : 'border-gray-200 dark:border-slate-700'
          } bg-white dark:bg-slate-800`}
        >
          {/* Item Header */}
          <button
            onClick={() => onToggleExpanded(request.id)}
            className="w-full p-4 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between transition"
          >
            <div className="flex items-center gap-4 flex-1 text-left">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {request.employee?.full_name || 'N/A'}
                  </h3>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {getRequestTypeLabel(request.request_type)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {request.employee?.email} • Date: {new Date(request.requested_date).toLocaleDateString('en-GB')}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Reason: {request.reason}
                </p>
              </div>
            </div>
            {expandedId === request.id ? (
              <Icon name="chevron-up" className="w-5 h-5 text-gray-500" />
            ) : (
              <Icon name="chevron-down" className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {/* Item Details */}
          {expandedId === request.id && (
            <div className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {request.new_check_in && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      New check-in
                    </p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">
                      {formatDateTime(request.new_check_in)}
                    </p>
                  </div>
                )}

                {request.new_check_out && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      New check-out
                    </p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">
                      {formatDateTime(request.new_check_out)}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Department
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {request.employee?.department?.name || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Submitted at
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDateTime(request.created_at)}
                  </p>
                </div>
              </div>

              {/* Notes Input */}
              <div>
                <Textarea
                  label="Notes (optional)"
                  name={`notes-${request.id}`}
                  rows={2}
                  placeholder="Enter notes..."
                  value={notes[request.id] || ''}
                  onChange={(e) => onUpdateNotes(request.id, e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => onReject(request.id)}
                  disabled={actionLoading === request.id}
                  variant="danger"
                  fullWidth
                  size="sm"
                  className="flex items-center justify-center gap-2"
                >
                  {actionLoading === request.id ? (
                    <Icon name="loader" className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon name="x" className="w-4 h-4" />
                  )}
                  Reject
                </Button>
                <Button
                  type="button"
                  onClick={() => onApprove(request.id)}
                  disabled={actionLoading === request.id}
                  variant="success"
                  fullWidth
                  size="sm"
                  className="flex items-center justify-center gap-2"
                >
                  {actionLoading === request.id ? (
                    <Icon name="loader" className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon name="check" className="w-4 h-4" />
                  )}
                  Approve
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
