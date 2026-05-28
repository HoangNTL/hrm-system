import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ContractsPage from '../pages/ContractsPage.jsx';
import { useContracts } from '../hooks/useContracts.js';

vi.mock('../hooks/useContracts.js', () => ({
  useContracts: vi.fn(),
}));

vi.mock('../components/ContractTable.jsx', () => ({
  default: ({ contracts }) => (
    <div data-testid="contract-table">{contracts.map((contract) => contract.code).join(',')}</div>
  ),
}));

const mockContracts = [
  { id: 1, code: 'CT-001', employee: { full_name: 'John Doe' } },
  { id: 2, code: 'CT-002', employee: { full_name: 'Jane Smith' } },
];

const createMockHookReturn = (overrides = {}) => ({
  contracts: mockContracts,
  employees: [],
  loading: false,
  employeesLoading: false,
  search: '',
  filters: { status: '', type: '' },
  pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
  selectedContracts: [],
  selectedContract: null,
  isModalOpen: false,
  isDetailsModalOpen: false,
  modalFormData: {},
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

function renderPage() {
  return render(
    <MemoryRouter>
      <ContractsPage />
    </MemoryRouter>,
  );
}

describe('ContractsPage', () => {
  beforeEach(() => {
    vi.mocked(useContracts).mockReturnValue(createMockHookReturn());
  });

  it('renders title, description, and count', () => {
    renderPage();
    expect(screen.getByText('Contracts')).toBeInTheDocument();
    expect(screen.getByText('Manage employment contracts and amendments')).toBeInTheDocument();
    expect(screen.getByText('2 contracts')).toBeInTheDocument();
  });

  it('renders search and filter controls', () => {
    renderPage();
    expect(screen.getByPlaceholderText(/search by code, employee name/i)).toBeInTheDocument();
    expect(screen.getByText('All Status')).toBeInTheDocument();
    expect(screen.getByText('All Types')).toBeInTheDocument();
  });

  it('calls handleAdd when add is clicked', () => {
    const handleAdd = vi.fn();
    vi.mocked(useContracts).mockReturnValue(createMockHookReturn({ handleAdd }));
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(handleAdd).toHaveBeenCalled();
  });
});
