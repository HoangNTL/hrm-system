import Button from '@components/ui/Button';
import Icon from '@components/ui/Icon';
import SearchBar from '@components/ui/SearchBar';
import Select from '@components/ui/Select';

import ContractTable from './ContractTable';
import ContractModal from './ContractModal';
import ContractDetailsModal from './ContractDetailsModal';
import { useContractsPage } from './useContractsPage';

const statusFilterOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'draft', label: 'Draft' },
  { value: 'expired', label: 'Expired' },
];

const typeFilterOptions = [
  { value: '', label: 'All Types' },
  { value: 'indefinite', label: 'Indefinite' },
  { value: 'fixed', label: 'Fixed Term' },
  { value: 'probation', label: 'Probation' },
  { value: 'intern', label: 'Internship' },
];

function ContractsPage() {
  const {
    contracts,
    employees,
    loading,
    employeesLoading,
    search,
    filters,
    pagination,
    selectedContracts,
    selectedContract,
    isModalOpen,
    isDetailsModalOpen,
    modalFormData,
    hasActiveFilters,
    handleSearch,
    handleFilterChange,
    handlePageChange,
    handleClearFilters,
    handleRowSelect,
    handleSelectAll,
    handleRowDoubleClick,
    handleAdd,
    handleEdit,
    handleModalClose,
    handleModalSuccess,
    handleFormDataChange,
    handleDetailsModalClose,
    handleEditFromDetails,
  } = useContractsPage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900 dark:text-secondary-50">
            Contracts
          </h1>
          <p className="text-body text-secondary-600 dark:text-secondary-400 mt-2">
            Manage employment contracts and amendments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleEdit}
            variant="outline"
            disabled={selectedContracts.length !== 1}
            className="inline-flex items-center"
          >
            <Icon name="pencil" className="w-5 h-5 mr-2" />
            Edit
          </Button>
          <Button onClick={handleAdd} variant="primary" className="inline-flex items-center">
            <Icon name="plus" className="w-5 h-5 mr-2" />
            Add
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={handleSearch}
              placeholder="Search by code, employee name..."
            />
          </div>
          <Select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            options={statusFilterOptions}
            className="w-full md:w-48"
          />
          <Select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            options={typeFilterOptions}
            className="w-full md:w-52"
          />
          <Button
            onClick={handleClearFilters}
            variant="outline"
            disabled={!hasActiveFilters}
            className="inline-flex items-center whitespace-nowrap"
            title="Clear filters"
          >
            <Icon name="x" className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
          <div className="text-sm text-secondary-600 dark:text-secondary-400 whitespace-nowrap">
            {pagination.total} contracts
          </div>
        </div>
      </div>

      <ContractTable
  contracts={contracts}
  loading={loading}
  pagination={pagination}
  onPageChange={handlePageChange}
  selectedContracts={selectedContracts}
  onRowSelect={handleRowSelect}
  onRowDoubleClick={handleRowDoubleClick}
  onSelectAll={handleSelectAll}
      />

      {/* {!loading && contracts.length === 0 && (
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-12">
          <div className="text-center">
            <Icon name="file-text" className="w-16 h-16 mx-auto text-secondary-400 dark:text-secondary-600 mb-4" />
            <h3 className="text-lg font-heading font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
              No Contracts
            </h3>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              {search ? 'Try adjusting your search criteria' : 'Get started by adding a new contract'}
            </p>
          </div>
        </div>
      )} */}

      <ContractModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
  contractToEdit={selectedContract}
        initialFormData={modalFormData}
        onFormDataChange={handleFormDataChange}
        employees={employees}
        employeesLoading={employeesLoading}
      />

      <ContractDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleDetailsModalClose}
  contract={selectedContract}
        onEdit={handleEditFromDetails}
      />
    </div>
  );
}

export default ContractsPage;
