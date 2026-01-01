import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Loader, Plus } from 'lucide-react';
import { attendanceRequestAPI } from '@/api/attendanceRequestAPI';
import EditAttendanceModal from '@/components/EditAttendanceModal';

export default function MyAttendanceRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  const limit = 10;

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, page]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await attendanceRequestAPI.getMyRequests({
        status: statusFilter || undefined,
        page,
        limit,
      });

      console.log('getMyRequests response:', response.data);
      
      if (response.data.ok) {
        const data = response.data.data || {};
        setRequests(data.requests || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'approved':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return '⏳ Chờ duyệt';
      case 'approved':
        return '✅ Đã duyệt';
      case 'rejected':
        return '❌ Bị từ chối';
      default:
        return status;
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
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            <Plus className="w-5 h-5" />
            Gửi đơn mới
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-2">
          {['', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              {status === '' ? 'Tất cả' : getStatusLabel(status)}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Bạn chưa gửi đơn nào. Bấm "Gửi đơn mới" để bắt đầu.
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
                }`}
              >
                {/* Item Header */}
                <button
                  onClick={() =>
                    setExpandedId(expandedId === request.id ? null : request.id)
                  }
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
                        Ngày: {new Date(request.requested_date).toLocaleDateString('vi-VN')}
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
                  <div className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 p-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Loại yêu cầu
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {getRequestTypeLabel(request.request_type)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Lý do
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {request.reason}
                      </p>
                    </div>

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
                        Ngày gửi
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDateTime(request.created_at)}
                      </p>
                    </div>

                    {request.status !== 'pending' && (
                      <>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Ngày xử lý
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDateTime(request.reviewed_at)}
                          </p>
                        </div>

                        {request.reviewer && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Người xử lý
                            </p>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {request.reviewer.email}
                            </p>
                          </div>
                        )}

                        {request.notes && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Ghi chú
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

      {/* Modal */}
      <EditAttendanceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        attendanceRecord={selectedAttendance}
        onSuccess={fetchRequests}
      />
    </div>
  );
}
