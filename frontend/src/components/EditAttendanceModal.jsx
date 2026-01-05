import React, { useState } from 'react';
import Icon from '@components/ui/Icon';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';
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
        setMessage('Please select the date you want to correct.');
        setMessageType('error');
        return;
      }

      if (!reason.trim()) {
        setMessage('Please enter a reason.');
        setMessageType('error');
        return;
      }

      if (!newCheckIn && !newCheckOut && requestType !== 'leave') {
        setMessage('Please provide the actual check-in or check-out time.');
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
        setMessage('Request submitted successfully! HR will review it as soon as possible.');
        setMessageType('success');

        // Reset form immediately
        setTimeout(() => {
          resetForm();
          onSuccess?.();
          onClose();
        }, 1500);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'An error occurred while submitting the request.');
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
            Attendance correction request
          </h2>
          {attendanceRecord && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Date: {new Date(attendanceRecord.date).toLocaleDateString('en-GB')}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Request Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Request type
            </label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="forgot_checkout">Forgot check-out</option>
              <option value="forgot_checkin">Forgot check-in</option>
              <option value="edit_time">Edit working time</option>
            </select>
          </div>

          {/* Ngày cần sửa */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Date to correct *
            </label>
            <Input
              type="date"
              value={requestedDate}
              onChange={(e) => setRequestedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select the date you forgot to check in/out (e.g. yesterday).
            </p>
          </div>

          {/* New Check-in */}
          {(requestType === 'forgot_checkin' || requestType === 'edit_time') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Actual check-in time *
              </label>
              <Input
                type="time"
                value={newCheckIn}
                onChange={(e) => setNewCheckIn(e.target.value)}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the time you actually started working (e.g. 08:00).
              </p>
            </div>
          )}

          {/* New Check-out */}
          {(requestType === 'forgot_checkout' || requestType === 'edit_time') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Actual check-out time *
              </label>
              <Input
                type="time"
                value={newCheckOut}
                onChange={(e) => setNewCheckOut(e.target.value)}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the time you actually finished working (e.g. 18:00).
              </p>
            </div>
          )}

          {/* Reason */}
          <div>
            <Textarea
              label="Reason *"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe why you need to correct this attendance record..."
              rows={3}
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
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Icon name="loader" className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Submit request'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
