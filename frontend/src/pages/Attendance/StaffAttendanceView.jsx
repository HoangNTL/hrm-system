import React from 'react';
import EditAttendanceModal from '@/components/EditAttendanceModal';
import StaffHeader from './StaffHeader';
import ShiftSelector from './ShiftSelector';
import CheckInOutCard from './CheckInOutCard';
import { useStaffAttendance } from './useStaffAttendance';

export default function StaffAttendanceView() {
  const {
    // State
    attendance,
    currentTime,
    shift,
    loading,
    message,
    status,
    shifts,
    selectedShiftId,
    modalOpen,

    // Setters
    setSelectedShiftId,
    setMessage,
    setModalOpen,

    // Handlers
    handleCheckIn,
    handleCheckOut,
    fetchTodayStatus,
  } = useStaffAttendance();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8 text-gray-900 dark:text-gray-100">
      <div className="max-w-2xl mx-auto">
        <StaffHeader currentTime={currentTime} />

        <ShiftSelector
          shifts={shifts}
          selectedShiftId={selectedShiftId}
          shift={shift}
          onShiftChange={setSelectedShiftId}
        />

        <CheckInOutCard
          attendance={attendance}
          message={message}
          status={status}
          onClearMessage={() => setMessage('')}
          selectedShiftId={selectedShiftId}
          loading={loading}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
        />
      </div>

      {/* Modal */}
      <EditAttendanceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        attendanceRecord={attendance ? { ...attendance, date: new Date() } : null}
        onSuccess={() => {
          setModalOpen(false);
          fetchTodayStatus(selectedShiftId);
        }}
      />
    </div>
  );
}
