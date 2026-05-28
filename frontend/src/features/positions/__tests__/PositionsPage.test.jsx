import { fireEvent, render, screen } from '@testing-library/react';

import PositionsPage from '../pages/PositionsPage.jsx';
import { usePositions } from '../hooks/usePositions.js';

vi.mock('../hooks/usePositions.js', () => ({
  usePositions: vi.fn(),
}));

const mockPositions = [
  { id: 1, name: 'Software Engineer' },
  { id: 2, name: 'Project Manager' },
];

const createMockHookReturn = (overrides = {}) => ({
  positions: mockPositions,
  loading: false,
  search: '',
  pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
  selectedPositions: [],
  isModalOpen: false,
  isDeleteModalOpen: false,
  deleteLoading: false,
  modalFormData: { name: '', description: '', status: true },
  handleSearch: vi.fn(),
  handlePageChange: vi.fn(),
  handleRowSelect: vi.fn(),
  handleSelectAll: vi.fn(),
  handleEdit: vi.fn(),
  handleAdd: vi.fn(),
  handleModalSuccess: vi.fn(),
  handleModalClose: vi.fn(),
  handleFormDataChange: vi.fn(),
  handleDelete: vi.fn(),
  handleConfirmDelete: vi.fn(),
  handleCancelDelete: vi.fn(),
  ...overrides,
});

describe('PositionsPage', () => {
  beforeEach(() => {
    vi.mocked(usePositions).mockReturnValue(createMockHookReturn());
  });

  it('renders title and description', () => {
    render(<PositionsPage />);
    expect(screen.getByText('Positions')).toBeInTheDocument();
    expect(screen.getByText('Manage job positions and roles')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<PositionsPage />);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('renders search and record count', () => {
    render(<PositionsPage />);
    expect(screen.getByPlaceholderText('Search positions...')).toBeInTheDocument();
    expect(screen.getByText('2 records found')).toBeInTheDocument();
  });

  it('calls handleAdd when add is clicked', () => {
    const handleAdd = vi.fn();
    vi.mocked(usePositions).mockReturnValue(createMockHookReturn({ handleAdd }));
    render(<PositionsPage />);
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(handleAdd).toHaveBeenCalled();
  });
});
