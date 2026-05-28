import React from 'react';
import Icon from '@components/ui/Icon';
import Button from '@components/ui/Button';
import { formatTime } from './StaffUtils';

export default function CheckInOutCard({
  attendance,
  message,
  status,
  onClearMessage,
  selectedShiftId,
  loading,
  onCheckIn,
  onCheckOut
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 mb-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Today</h2>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border-2 border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500 mb-2">Check-in</p>
          {attendance?.check_in ? (
            <>
              <p className="text-2xl font-bold text-green-600">
                {formatTime(attendance.check_in)}
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                {attendance.status === 'late' ? (
                  <>
                    <Icon name="alert-circle" className="w-4 h-4" />
                    <span>Late</span>
                  </>
                ) : (
                  <>
                    <Icon name="check-circle" className="w-4 h-4" />
                    <span>On time</span>
                  </>
                )}
              </p>
            </>
          ) : (
            <p className="text-2xl font-bold text-gray-400">--:--</p>
          )}
        </div>

        <div className="border-2 border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500 mb-2">Check-out</p>
          {attendance?.check_out ? (
            <>
              <p className="text-2xl font-bold text-green-600">
                {formatTime(attendance.check_out)}
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <Icon name="clock" className="w-4 h-4" />
                <span>{attendance.work_hours}h</span>
              </p>
            </>
          ) : (
            <p className="text-2xl font-bold text-gray-400">--:--</p>
          )}
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-lg flex items-start gap-3"
          style={{
            backgroundColor: status === 'success' ? '#ecfdf5' : '#fef2f2',
            border: status === 'success' ? '1px solid #10b981' : '1px solid #ef4444'
          }}>
          {status === 'success' && <Icon name="check-circle" className="w-6 h-6 text-green-600 flex-shrink-0" />}
          {status === 'error' && <Icon name="alert-circle" className="w-6 h-6 text-red-600 flex-shrink-0" />}
          <p style={{
            color: status === 'success' ? '#059669' : '#dc2626'
          }} className="font-medium flex-1">
            {message}
          </p>
          <button
            onClick={onClearMessage}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          onClick={onCheckIn}
          disabled={!selectedShiftId || !!attendance?.check_in || loading}
          variant="success"
          fullWidth
        >
          {loading ? (
            <Icon name="loader" className="w-5 h-5 animate-spin" />
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Icon name="log-in" className="w-5 h-5" />
              <span>Check-in</span>
            </span>
          )}
        </Button>

        <Button
          type="button"
          onClick={onCheckOut}
          disabled={!selectedShiftId || !attendance?.check_in || !!attendance?.check_out || loading}
          variant="outline"
          fullWidth
          className="border-orange-500 text-orange-600 hover:bg-orange-50"
        >
          {loading ? (
            <Icon name="loader" className="w-5 h-5 animate-spin" />
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Icon name="log-out" className="w-5 h-5" />
              <span>Check-out</span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
