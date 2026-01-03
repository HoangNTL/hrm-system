import { useState, useEffect } from 'react';
import { attendanceRequestAPI } from '@/api/attendanceRequestAPI';
import toast from 'react-hot-toast';

export function useApproveAttendanceRequests() {
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

  const toggleExpanded = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const updateNotes = (requestId, value) => {
    setNotes((prev) => ({
      ...prev,
      [requestId]: value,
    }));
  };

  const totalPages = Math.ceil(total / limit);

  return {
    // State
    requests,
    loading,
    expandedId,
    page,
    total,
    totalPages,
    actionLoading,
    notes,

    // Handlers
    toggleExpanded,
    handlePageChange,
    handleApprove,
    handleReject,
    updateNotes,
  };
}
