import React from 'react';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
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
              <p className="text-xs text-green-600 mt-1">
                {attendance.status === 'late' ? '⚠️ Late' : '✅ On time'}
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
              <p className="text-xs text-green-600 mt-1">
                ✅ {attendance.work_hours}h
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
          {status === 'success' && <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />}
          {status === 'error' && <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />}
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
        <button
          onClick={onCheckIn}
          disabled={!selectedShiftId || !!attendance?.check_in || loading}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
            !selectedShiftId || !!attendance?.check_in || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader className="w-5 h-5 animate-spin" />
            </span>
          ) : (
            '📍 CHECK-IN'
          )}
        </button>

        <button
          onClick={onCheckOut}
          disabled={!selectedShiftId || !attendance?.check_in || !!attendance?.check_out || loading}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
            !selectedShiftId || !attendance?.check_in || !!attendance?.check_out || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader className="w-5 h-5 animate-spin" />
            </span>
          ) : (
            '🚪 CHECK-OUT'
          )}
        </button>
      </div>
    </div>
  );
}
