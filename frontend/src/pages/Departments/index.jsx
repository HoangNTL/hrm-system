import { useState, useEffect } from 'react';
import { departmentService } from '../../services/departmentService';
import { handleAPIError } from '../../api';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import Modal from '../../components/ui/Modal';

function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await departmentService.getDepartments({ page: pagination.page, limit: pagination.limit, search: searchTerm });
      setDepartments(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [pagination.page, pagination.limit, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const columns = [
    { key: 'department_id', label: 'No.', render: (v, item, index) => <span>{index + 1 + (pagination.page - 1) * pagination.limit}</span> },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description', render: (v) => <div className="max-w-xs truncate" title={v}>{v}</div> },
    { key: 'created_at', label: 'Created At', render: (v) => (v ? new Date(v).toLocaleDateString('en-GB') : '-') },
  ];

  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900 dark:text-secondary-50">Departments</h1>
          <p className="text-body text-secondary-600 dark:text-secondary-400 mt-2">Manage departments</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddForm(true)}>
          <Icon name="plus" className="w-5 h-5" />
          Add Department
        </Button>
      </div>

      <Modal open={showAddForm} title="Add Department" onClose={() => setShowAddForm(false)} size="md">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setCreating(true);
              await departmentService.createDepartment(formData);
              setShowAddForm(false);
              setFormData({ name: '', description: '' });
              setPagination((prev) => ({ ...prev, page: 1 }));
              await fetchDepartments();
            } catch (err) {
              console.error('Create department error', err);
              setError(handleAPIError(err));
            } finally {
              setCreating(false);
            }
          }}
          className="space-y-4"
        >
          <div>
            <input
              required
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData((s) => ({ ...s, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="danger" onClick={() => setShowAddForm(false)} disabled={creating}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {error && (
        <div className="p-4 rounded-lg bg-error/10 border border-error/20">
          <p className="text-sm text-error">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchDepartments} className="mt-2">Retry</Button>
        </div>
      )}

      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search departments..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 pl-10 rounded-lg border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 placeholder:text-secondary-400 dark:placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500">
                <Icon name="search" className="w-5 h-5" />
              </div>
            </div>
          </div>
          <Button type="submit" variant="primary" disabled={loading}>Search</Button>
          {searchTerm && <Button type="button" variant="outline" disabled={loading} onClick={() => { setSearchTerm(''); setSearchInput(''); setPagination((p) => ({ ...p, page: 1 })); }}>Clear</Button>}
        </form>
      </div>

      <Table columns={columns} data={departments} loading={loading} />

      {!loading && !error && pagination.totalPages > 1 && (
        <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))} />
      )}
    </div>
  );
}

export default DepartmentsPage;
