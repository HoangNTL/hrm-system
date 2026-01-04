import React from 'react';
import Icon from '@components/ui/Icon';
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
          Không có đơn nào chờ duyệt.
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
                  {request.employee?.email} • Ngày: {new Date(request.requested_date).toLocaleDateString('vi-VN')}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Lý do: {request.reason}
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
                      Check-in mới
                    </p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">
                      {formatDateTime(request.new_check_in)}
                    </p>
                  </div>
                )}

                {request.new_check_out && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Check-out mới
                    </p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">
                      {formatDateTime(request.new_check_out)}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Phòng ban
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {request.employee?.department?.name || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Ngày gửi
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDateTime(request.created_at)}
                  </p>
                </div>
              </div>

              {/* Notes Input */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={notes[request.id] || ''}
                  onChange={(e) => onUpdateNotes(request.id, e.target.value)}
                  placeholder="Nhập ghi chú..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onReject(request.id)}
                  disabled={actionLoading === request.id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
                >
                  {actionLoading === request.id ? (
                    <Icon name="loader" className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon name="x" className="w-4 h-4" />
                  )}
                  Từ chối
                </button>
                <button
                  onClick={() => onApprove(request.id)}
                  disabled={actionLoading === request.id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
                >
                  {actionLoading === request.id ? (
                    <Icon name="loader" className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon name="check" className="w-4 h-4" />
                  )}
                  Duyệt
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
