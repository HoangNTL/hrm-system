import { useState, useEffect } from 'react';
import { attendanceRequestAPI } from '@/api/attendanceRequestAPI';

export function useAttendanceRequests() {
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

  const toggleExpanded = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const openModal = (attendance = null) => {
    setSelectedAttendance(attendance);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAttendance(null);
  };

  const totalPages = Math.ceil(total / limit);

  return {
    // State
    requests,
    loading,
    expandedId,
    statusFilter,
    page,
    totalPages,
    modalOpen,
    selectedAttendance,

    // Handlers
    toggleExpanded,
    handleFilterChange,
    handlePageChange,
    openModal,
    closeModal,
    fetchRequests,
  };
}
