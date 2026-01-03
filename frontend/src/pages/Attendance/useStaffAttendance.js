import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/userSlice';
import axios from '@/api/axios';

export function useStaffAttendance() {
  const user = useSelector(selectUser);
  const [attendance, setAttendance] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [shifts, setShifts] = useState([]);
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const employeeId = user?.employee_id;

  // Fetch shifts list
  const fetchShifts = useCallback(async () => {
    try {
      const response = await axios.get(`/attendance/shifts`);
      if (response.data.success) {
        console.log('Shifts from API:', response.data.data);
        setShifts(response.data.data);
        if (response.data.data.length > 0 && !selectedShiftId) {
          setSelectedShiftId(response.data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  }, [selectedShiftId]);

  // Fetch today's attendance status
  const fetchTodayStatus = useCallback(async (shiftIdParam) => {
    try {
      const response = await axios.get(`/attendance/today`, {
        params: shiftIdParam ? { shiftId: shiftIdParam } : {}
      });
      if (response.data.success) {
        setAttendance(response.data.data.attendance);
        setShift(response.data.data.shift);
        if (!shiftIdParam && response.data.data.shift?.id) {
          setSelectedShiftId(response.data.data.shift.id);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  }, []);

  // Load shifts on mount
  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // Load today status when employee ID available
  useEffect(() => {
    if (!employeeId || !selectedShiftId) return;
    fetchTodayStatus(selectedShiftId);
  }, [employeeId, selectedShiftId, fetchTodayStatus]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-clear message after timeout
  useEffect(() => {
    if (!message) return;
    const timeoutMs = status === 'error' ? 6000 : 3000;
    const timer = setTimeout(() => setMessage(''), timeoutMs);
    return () => clearTimeout(timer);
  }, [message, status]);

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      setMessage('');

      if (!selectedShiftId) {
        setMessage('Please select a shift');
        setStatus('error');
        setLoading(false);
        return;
      }

      console.log('Check-in request:', { employeeId, shiftId: selectedShiftId });

      const response = await axios.post('/attendance/check-in', {
        employeeId,
        shiftId: selectedShiftId
      });

      if (response.data.success) {
        setMessage(response.data.message);
        setStatus('success');
        fetchTodayStatus(selectedShiftId);
      }
    } catch (error) {
      console.error('Check-in error details:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Check-in failed';
      setMessage(errorMsg);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      setMessage('');

      if (!selectedShiftId) {
        setMessage('Please select a shift');
        setStatus('error');
        setLoading(false);
        return;
      }

      const response = await axios.post('/attendance/check-out', {
        employeeId,
        shiftId: selectedShiftId
      });

      console.log('Check-out response:', response.data);

      if (response.data.success) {
        setMessage(response.data.message);
        setStatus('success');
        fetchTodayStatus(selectedShiftId);
      } else {
        setMessage(response.data.message || 'Lỗi check-out');
        setStatus('error');
      }
    } catch (error) {
      console.error('Check-out error details:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || 'Check-out failed';
      console.log('Setting error message:', errorMsg);
      setMessage(errorMsg);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}
