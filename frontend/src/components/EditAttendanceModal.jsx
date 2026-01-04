import React, { useState } from 'react';
import Icon from '@components/ui/Icon';
import { attendanceRequestAPI } from '@/api/attendanceRequestAPI';

export default function EditAttendanceModal({ isOpen, onClose, attendanceRecord, onSuccess }) {
  const [requestType, setRequestType] = useState('forgot_checkout');
  const [reason, setReason] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [newCheckIn, setNewCheckIn] = useState('');
  const [newCheckOut, setNewCheckOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      if (!requestedDate) {
        setMessage('Vui lòng chọn ngày cần sửa chấm công');
        setMessageType('error');
        return;
      }

      if (!reason.trim()) {
        setMessage('Vui lòng nhập lý do');
        setMessageType('error');
        return;
      }

      if (!newCheckIn && !newCheckOut && requestType !== 'leave') {
        setMessage('Vui lòng nhập giờ check-in hoặc check-out thực tế');
        setMessageType('error');
        return;
      }

      setLoading(true);
      const payload = {
        attendanceId: attendanceRecord?.id,
        requestType,
        reason,
        requestedDate: new Date(requestedDate).toISOString(),
      };

      if (newCheckIn) {
        // Combine requestedDate with time
        const [hours, minutes] = newCheckIn.split(':');
        const checkInDateTime = new Date(requestedDate);
        checkInDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        payload.newCheckIn = checkInDateTime.toISOString();
      }
      if (newCheckOut) {
        // Combine requestedDate with time
        const [hours, minutes] = newCheckOut.split(':');
        const checkOutDateTime = new Date(requestedDate);
        checkOutDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        payload.newCheckOut = checkOutDateTime.toISOString();
      }

      const response = await attendanceRequestAPI.createRequest(payload);

      if (response.data.ok || response.data.success) {
        setMessage('Gửi đơn thành công! HR sẽ duyệt trong thời gian sớm nhất.');
        setMessageType('success');

        // Reset form immediately
        setTimeout(() => {
          resetForm();
          onSuccess?.();
          onClose();
        }, 1500);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Có lỗi khi gửi đơn');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRequestType('forgot_checkout');
    setReason('');
    setRequestedDate('');
    setNewCheckIn('');
    setNewCheckOut('');
    setMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Xin sửa chấm công
          </h2>
          {attendanceRecord && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Ngày: {new Date(attendanceRecord.date).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Request Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Loại yêu cầu
            </label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="forgot_checkout">Quên check-out</option>
              <option value="forgot_checkin">Quên check-in</option>
              <option value="edit_time">Sửa giờ làm việc</option>
            </select>
          </div>

          {/* Ngày cần sửa */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Ngày cần sửa chấm công *
            </label>
            <input
              type="date"
              value={requestedDate}
              onChange={(e) => setRequestedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Chọn ngày bạn quên chấm công (ví dụ: hôm qua)
            </p>
          </div>

          {/* New Check-in */}
          {(requestType === 'forgot_checkin' || requestType === 'edit_time') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Giờ check-in thực tế *
              </label>
              <input
                type="time"
                value={newCheckIn}
                onChange={(e) => setNewCheckIn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Nhập giờ bạn thực tế bắt đầu làm việc (ví dụ: 08:00)
              </p>
            </div>
          )}

          {/* New Check-out */}
          {(requestType === 'forgot_checkout' || requestType === 'edit_time') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Giờ check-out thực tế *
              </label>
              <input
                type="time"
                value={newCheckOut}
                onChange={(e) => setNewCheckOut(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Nhập giờ bạn thực tế kết thúc làm việc (ví dụ: 18:00)
              </p>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Lý do *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do xin sửa chấm công..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-lg flex items-start gap-2 ${
                messageType === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}
            >
              {messageType === 'success' ? (
                <Icon name="check-circle" className={`w-5 h-5 flex-shrink-0 text-green-600 dark:text-green-400 mt-0.5`} />
              ) : (
                <Icon name="alert-circle" className={`w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5`} />
              )}
              <p
                className={`text-sm ${
                  messageType === 'success'
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}
              >
                {message}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition"
          >
            Đóng
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Icon name="loader" className="w-4 h-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              'Gửi đơn'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
