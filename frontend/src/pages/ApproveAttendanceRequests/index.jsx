import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Loader, Check, X } from 'lucide-react';
import { attendanceRequestAPI } from '@/api/attendanceRequestAPI';
import toast from 'react-hot-toast';

export default function ApproveAttendanceRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
  const [notes, setNotes] = useState({});

  const limit = 10;

  useEffect(() => {
    fetchRequests();
  }, [page]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await attendanceRequestAPI.getAllRequests({
        status: 'pending',
        page,
        limit,
      });

      console.log('getAllRequests response:', response.data);
      
      if (response.data.ok) {
        const data = response.data.data || {};
        setRequests(data.requests || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Lỗi khi lấy danh sách đơn');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setActionLoading(requestId);
      const response = await attendanceRequestAPI.approveRequest(requestId, {
        notes: notes[requestId] || '',
      });

      if (response.data.ok) {
        toast.success('Duyệt đơn thành công');
        setExpandedId(null);
        setNotes((prev) => ({ ...prev, [requestId]: '' }));
        await fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi duyệt đơn');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setActionLoading(requestId);
      const response = await attendanceRequestAPI.rejectRequest(requestId, {
        notes: notes[requestId] || '',
      });

      if (response.data.ok) {
        toast.success('Từ chối đơn thành công');
        setExpandedId(null);
        setNotes((prev) => ({ ...prev, [requestId]: '' }));
        await fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi từ chối đơn');
    } finally {
      setActionLoading(null);
    }
  };

  const getRequestTypeLabel = (type) => {
    switch (type) {
      case 'forgot_checkin':
        return 'Quên check-in';
      case 'forgot_checkout':
        return 'Quên check-out';
      case 'edit_time':
        return 'Sửa giờ làm';
      case 'leave':
        return 'Xin nghỉ';
      default:
        return type;
    }
  };

  const formatDateTime = (date) => {
    if (!date) return '--';
    return new Date(date).toLocaleString('vi-VN');
  };

  const totalPages = Math.ceil(total / limit);

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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Không có đơn nào chờ duyệt. 🎉
            </p>
          </div>
        ) : (
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
                  onClick={() =>
                    setExpandedId(expandedId === request.id ? null : request.id)
                  }
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
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
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
                        onChange={(e) =>
                          setNotes((prev) => ({
                            ...prev,
                            [request.id]: e.target.value,
                          }))
                        }
                        placeholder="Nhập ghi chú..."
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={actionLoading === request.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
                      >
                        {actionLoading === request.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        Từ chối
                      </button>
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={actionLoading === request.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
                      >
                        {actionLoading === request.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Duyệt
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 transition"
            >
              ← Trước
            </button>
            <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Trang {page}/{totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 transition"
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
