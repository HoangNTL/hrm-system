import React from 'react';
import Icon from '@components/ui/Icon';
import {
  getStatusColor,
  getStatusLabel,
  getRequestTypeLabel,
  formatDateTime,
} from './RequestUtils';

export default function RequestList({ requests, loading, expandedId, onToggleExpanded }) {
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
          You haven't submitted any requests yet. Click "New request" to create one.
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
          }`}
        >
          {/* Item Header */}
          <button
            onClick={() => onToggleExpanded(request.id)}
            className="w-full p-4 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between transition"
          >
            <div className="flex items-center gap-4 flex-1 text-left">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {getRequestTypeLabel(request.request_type)}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {getStatusLabel(request.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Date: {new Date(request.requested_date).toLocaleDateString('en-US')}
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
            <div className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Request type
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {getRequestTypeLabel(request.request_type)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Reason
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {request.reason}
                </p>
              </div>

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
                  Submitted at
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDateTime(request.created_at)}
                </p>
              </div>

              {request.status !== 'pending' && (
                <>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Reviewed at
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDateTime(request.reviewed_at)}
                    </p>
                  </div>

                  {request.reviewer && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Reviewer
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {request.reviewer.email}
                      </p>
                    </div>
                  )}

                  {request.notes && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Notes
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {request.notes}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
