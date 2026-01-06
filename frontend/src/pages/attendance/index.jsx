import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/userSlice';
import StaffAttendanceView from './StaffAttendanceView';
import AdminAttendanceView from './AdminAttendanceView';

export default function AttendancePage() {
  const user = useSelector(selectUser);
  const userRole = user?.role;

  // STAFF: Check-in/Check-out form
  if (userRole === 'STAFF') {
    return <StaffAttendanceView />;
  }

  // ADMIN/HR: Attendance records list
  return <AdminAttendanceView />;
}

