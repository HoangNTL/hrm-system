import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ContractsPage from '..';
import { useContractsPage } from '../useContractsPage';

vi.mock('../useContractsPage', () => ({
  useContractsPage: vi.fn(),
}));

vi.mock('../ContractTable', () => ({
  default: ({ contracts, loading, onRowSelect, onRowDoubleClick }) => (
    <div data-testid="contract-table">
      {loading ? (
        <span>Loading...</span>
      ) : (
        contracts.map((contract) => (
          <div
            key={contract.id}
            data-testid={`contract-row-${contract.id}`}
            onClick={() => onRowSelect(contract)}
            onDoubleClick={() => onRowDoubleClick(contract)}
          >
            {contract.code} - {contract.employee?.full_name}
          </div>
        ))
      )}
    </div>
  ),
}));

vi.mock('../ContractModal', () => ({
  default: ({ isOpen, onClose, onSuccess }) =>
    isOpen ? (
      <div data-testid="contract-modal">
        <button onClick={onClose}>Close Modal</button>
        <button onClick={onSuccess}>Save Contract</button>
      </div>
    ) : null,
}));

vi.mock('../ContractDetailsModal', () => ({
  default: ({ isOpen, onClose, contract, onEdit }) =>
    isOpen ? (
      <div data-testid="contract-details-modal">
        <span>{contract?.code}</span>
        <button onClick={onClose}>Close Details</button>
        <button onClick={onEdit}>Edit from Details</button>
      </div>
    ) : null,
}));

const mockContracts = [
  {
    id: 1,
    code: 'CT-2025-001',
    employee_id: 1,
    employee: { full_name: 'John Doe' },
    contract_type: 'indefinite',
    status: 'active',
    start_date: '2025-01-01',
    end_date: null,
    salary: 15000000,
  },
  {
    id: 2,
    code: 'CT-2025-002',
    employee_id: 2,
    employee: { full_name: 'Jane Smith' },
    contract_type: 'fixed',
    status: 'pending',
    start_date: '2025-02-01',
    end_date: '2026-02-01',
    salary: 12000000,
  },
];

const mockEmployees = [
  { id: 1, full_name: 'John Doe' },
  { id: 2, full_name: 'Jane Smith' },
  { id: 3, full_name: 'Bob Wilson' },
];

const createMockHookReturn = (overrides = {}) => ({
  contracts: mockContracts,
  employees: mockEmployees,
  loading: false,
  employeesLoading: false,
  search: '',
  filters: { status: '', type: '', employeeId: '' },
  pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
  selectedContracts: [],
  selectedContract: null,
  isModalOpen: false,
  isDetailsModalOpen: false,
  modalFormData: {
    code: '',
    employee_id: '',
    contract_type: '',
    status: 'draft',
    start_date: '',
    end_date: '',
    salary: '',
    notes: '',
    work_location: '',
  },
  hasActiveFilters: false,
  handleSearch: vi.fn(),
  handleFilterChange: vi.fn(),
  handlePageChange: vi.fn(),
  handleClearFilters: vi.fn(),
  handleRowSelect: vi.fn(),
  handleSelectAll: vi.fn(),
  handleRowDoubleClick: vi.fn(),
  handleAdd: vi.fn(),
  handleEdit: vi.fn(),
  handleModalClose: vi.fn(),
  handleModalSuccess: vi.fn(),
  handleFormDataChange: vi.fn(),
  handleDetailsModalClose: vi.fn(),
  handleEditFromDetails: vi.fn(),
  ...overrides,
});

const renderContractsPage = () => {
  return render(
    <MemoryRouter>
      <ContractsPage />
    </MemoryRouter>,
  );
};

describe('ContractsPage', () => {
  beforeEach(() => {
    vi.mocked(useContractsPage).mockReturnValue(createMockHookReturn());
  });

  describe('Page Header', () => {
    it('renders page title and description', () => {
      renderContractsPage();

      expect(screen.getByText('Contracts')).toBeInTheDocument();
      expect(screen.getByText('Manage employment contracts and amendments')).toBeInTheDocument();
    });

    it('renders Add button', () => {
      renderContractsPage();

      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });

    it('renders Edit button', () => {
      renderContractsPage();

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('disables Edit button when no contract is selected', () => {
      renderContractsPage();

      const editButton = screen.getByRole('button', { name: /edit/i });
      expect(editButton).toBeDisabled();
    });

    it('enables Edit button when exactly one contract is selected', () => {
      vi.mocked(useContractsPage).mockReturnValue(
        createMockHookReturn({
          selectedContracts: [mockContracts[0]],
        }),
      );

      renderContractsPage();

      const editButton = screen.getByRole('button', { name: /edit/i });
      expect(editButton).not.toBeDisabled();
    });
  });

  describe('Search and Filters', () => {
    it('renders search bar', () => {
      renderContractsPage();

      expect(screen.getByPlaceholderText(/search by code, employee name/i)).toBeInTheDocument();
    });

    it('renders status filter select', () => {
      renderContractsPage();

      expect(screen.getByText('All Status')).toBeInTheDocument();
    });

    it('renders type filter select', () => {
      renderContractsPage();

      expect(screen.getByText('All Types')).toBeInTheDocument();
    });

    it('renders Clear Filters button', () => {
      renderContractsPage();

      expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
    });

    it('disables Clear Filters button when no active filters', () => {
      renderContractsPage();

      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      expect(clearButton).toBeDisabled();
    });

    it('enables Clear Filters button when filters are active', () => {
      vi.mocked(useContractsPage).mockReturnValue(
        createMockHookReturn({
          hasActiveFilters: true,
        }),
      );

      renderContractsPage();

      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      expect(clearButton).not.toBeDisabled();
    });

    it('displays total contracts count', () => {
      renderContractsPage();

      expect(screen.getByText('2 contracts')).toBeInTheDocument();
    });

    it('calls handleClearFilters when Clear Filters button is clicked', () => {
      const handleClearFilters = vi.fn();
      vi.mocked(useContractsPage).mockReturnValue(
        createMockHookReturn({
          hasActiveFilters: true,
          handleClearFilters,
        }),
      );

      renderContractsPage();

      fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));

      expect(handleClearFilters).toHaveBeenCalled();
    });
  });

  describe('Contract Table', () => {
    it('renders contract table', () => {
      renderContractsPage();

      expect(screen.getByTestId('contract-table')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      vi.mocked(useContractsPage).mockReturnValue(createMockHookReturn({ loading: true }));

      renderContractsPage();

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders contract rows', () => {
      renderContractsPage();

      expect(screen.getByTestId('contract-row-1')).toBeInTheDocument();
      expect(screen.getByTestId('contract-row-2')).toBeInTheDocument();
    });

    it('calls handleRowSelect when row is clicked', () => {
      const handleRowSelect = vi.fn();
      vi.mocked(useContractsPage).mockReturnValue(createMockHookReturn({ handleRowSelect }));

      renderContractsPage();

      fireEvent.click(screen.getByTestId('contract-row-1'));

      expect(handleRowSelect).toHaveBeenCalledWith(mockContracts[0]);
    });

    it('calls handleRowDoubleClick when row is double clicked', () => {
      const handleRowDoubleClick = vi.fn();
      vi.mocked(useContractsPage).mockReturnValue(createMockHookReturn({ handleRowDoubleClick }));

      renderContractsPage();

      fireEvent.doubleClick(screen.getByTestId('contract-row-1'));

      expect(handleRowDoubleClick).toHaveBeenCalledWith(mockContracts[0]);
    });
  });

  describe('Action Buttons', () => {
    it('calls handleAdd when Add button is clicked', () => {
      const handleAdd = vi.fn();
      vi.mocked(useContractsPage).mockReturnValue(createMockHookReturn({ handleAdd }));

      renderContractsPage();

      fireEvent.click(screen.getByRole('button', { name: /add/i }));

      expect(handleAdd).toHaveBeenCalled();
    });

    it('calls handleEdit when Edit button is clicked', () => {
      const handleEdit = vi.fn();
      vi.mocked(useContractsPage).mockReturnValue(
        createMockHookReturn({
          selectedContracts: [mockContracts[0]],
          handleEdit,
        }),
      );

      renderContractsPage();

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      expect(handleEdit).toHaveBeenCalled();
    });
  });

  describe('Contract Modal', () => {
    it('does not render modal when isModalOpen is false', () => {
      renderContractsPage();

      expect(screen.queryByTestId('contract-modal')).not.toBeInTheDocument();
    });

    it('renders modal when isModalOpen is true', () => {
      vi.mocked(useContractsPage).mockReturnValue(createMockHookReturn({ isModalOpen: true }));

      renderContractsPage();

      expect(screen.getByTestId('contract-modal')).toBeInTheDocument();
    });

    it('calls handleModalClose when modal close button is clicked', () => {
      const handleModalClose = vi.fn();
      vi.mocked(useContractsPage).mockReturnValue(
        createMockHookReturn({
          isModalOpen: true,
          handleModalClose,
        }),
      );

      renderContractsPage();

      fireEvent.click(screen.getByText('Close Modal'));

      expect(handleModalClose).toHaveBeenCalled();
    });

    it('calls handleModalSuccess when save button is clicked', () => {
      const handleModalSuccess = vi.fn();
      vi.mocked(useContractsPage).mockReturnValue(
        createMockHookReturn({
          isModalOpen: true,
          handleModalSuccess,
        }),
      );

      renderContractsPage();

      fireEvent.click(screen.getByText('Save Contract'));

      expect(handleModalSuccess).toHaveBeenCalled();
    });
  });

  describe('Contract Details Modal', () => {
    it('does not render details modal when isDetailsModalOpen is false', () => {
      renderContractsPage();

      expect(screen.queryByTestId('contract-details-modal')).not.toBeInTheDocument();
    });

    it('renders details modal when isDetailsModalOpen is true', () => {
      vi.mocked(useContractsPage).mockReturnValue(
        createMockHookReturn({
          isDetailsModalOpen: true,
          selectedContract: mockContracts[0],
        }),
      );

      renderContractsPage();

      expect(screen.getByTestId('contract-details-modal')).toBeInTheDocument();
    });

    it('displays contract code in details modal', () => {
      vi.mocked(useContractsPage).mockReturnValue(
        createMockHookReturn({
          isDetailsModalOpen: true,
          selectedContract: mockContracts[0],
        }),
      );

      renderContractsPage();

      expect(screen.getByText('CT-2025-001')).toBeInTheDocument();
    });

    it('calls handleDetailsModalClose when close button is clicked', () => {
      const handleDetailsModalClose = vi.fn();
      vi.mocked(useContractsPage).mockReturnValue(
        createMockHookReturn({
          isDetailsModalOpen: true,
          selectedContract: mockContracts[0],
          handleDetailsModalClose,
        }),
      );

      renderContractsPage();

      fireEvent.click(screen.getByText('Close Details'));

      expect(handleDetailsModalClose).toHaveBeenCalled();
    });

    it('calls handleEditFromDetails when Edit button is clicked', () => {
      const handleEditFromDetails = vi.fn();
      vi.mocked(useContractsPage).mockReturnValue(
        createMockHookReturn({
          isDetailsModalOpen: true,
          selectedContract: mockContracts[0],
          handleEditFromDetails,
        }),
      );

      renderContractsPage();

      fireEvent.click(screen.getByText('Edit from Details'));

      expect(handleEditFromDetails).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('renders empty contract table', () => {
      vi.mocked(useContractsPage).mockReturnValue(
        createMockHookReturn({
          contracts: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
        }),
      );

      renderContractsPage();

      expect(screen.getByTestId('contract-table')).toBeInTheDocument();
      expect(screen.getByText('0 contracts')).toBeInTheDocument();
    });
  });
});
