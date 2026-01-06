import { render, screen, fireEvent } from '@testing-library/react';
import PositionsPage from '..';
import { usePositionsPage } from '../usePositionsPage';

vi.mock('../usePositionsPage', () => ({
  usePositionsPage: vi.fn(),
}));

const mockPositions = [
  { id: 1, name: 'Software Engineer', description: 'Develop software applications', status: true },
  { id: 2, name: 'Project Manager', description: 'Manage projects', status: true },
  { id: 3, name: 'Designer', description: 'Design UI/UX', status: false },
];

const createMockHookReturn = (overrides = {}) => ({
  // state
  positions: mockPositions,
  loading: false,
  search: '',
  pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
  selectedPositions: [],
  isModalOpen: false,
  isDeleteModalOpen: false,
  deleteLoading: false,
  modalFormData: {
    name: '',
    description: '',
    status: true,
  },

  // handlers
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
    vi.mocked(usePositionsPage).mockReturnValue(createMockHookReturn());
  });

  it('renders page header with title and description', () => {
    render(<PositionsPage />);

    expect(screen.getByText('Positions')).toBeInTheDocument();
    expect(screen.getByText('Manage job positions and roles')).toBeInTheDocument();
  });

  it('renders action buttons (Edit, Delete, Add)', () => {
    render(<PositionsPage />);

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('disables Edit button when no position is selected', () => {
    render(<PositionsPage />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeDisabled();
  });

  it('disables Delete button when no position is selected', () => {
    render(<PositionsPage />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeDisabled();
  });

  it('enables Edit button when exactly one position is selected', () => {
    vi.mocked(usePositionsPage).mockReturnValue(
      createMockHookReturn({
        selectedPositions: [mockPositions[0]],
      }),
    );

    render(<PositionsPage />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).not.toBeDisabled();
  });

  it('disables Edit button when multiple positions are selected', () => {
    vi.mocked(usePositionsPage).mockReturnValue(
      createMockHookReturn({
        selectedPositions: [mockPositions[0], mockPositions[1]],
      }),
    );

    render(<PositionsPage />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeDisabled();
  });

  it('enables Delete button when at least one position is selected', () => {
    vi.mocked(usePositionsPage).mockReturnValue(
      createMockHookReturn({
        selectedPositions: [mockPositions[0]],
      }),
    );

    render(<PositionsPage />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).not.toBeDisabled();
  });

  it('renders search bar with correct placeholder', () => {
    render(<PositionsPage />);

    expect(screen.getByPlaceholderText('Search positions...')).toBeInTheDocument();
  });

  it('renders record count text', () => {
    render(<PositionsPage />);

    expect(screen.getByText('3 records found')).toBeInTheDocument();
  });

  it('renders singular record text when only one record', () => {
    vi.mocked(usePositionsPage).mockReturnValue(
      createMockHookReturn({
        positions: [mockPositions[0]],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      }),
    );

    render(<PositionsPage />);

    expect(screen.getByText('1 record found')).toBeInTheDocument();
  });

  it('calls handleAdd when Add button is clicked', () => {
    const handleAdd = vi.fn();
    vi.mocked(usePositionsPage).mockReturnValue(createMockHookReturn({ handleAdd }));

    render(<PositionsPage />);

    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(handleAdd).toHaveBeenCalled();
  });

  it('calls handleEdit when Edit button is clicked', () => {
    const handleEdit = vi.fn();
    vi.mocked(usePositionsPage).mockReturnValue(
      createMockHookReturn({
        selectedPositions: [mockPositions[0]],
        handleEdit,
      }),
    );

    render(<PositionsPage />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(handleEdit).toHaveBeenCalled();
  });

  it('calls handleDelete when Delete button is clicked', () => {
    const handleDelete = vi.fn();
    vi.mocked(usePositionsPage).mockReturnValue(
      createMockHookReturn({
        selectedPositions: [mockPositions[0]],
        handleDelete,
      }),
    );

    render(<PositionsPage />);

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(handleDelete).toHaveBeenCalled();
  });

  it('renders delete confirmation modal when isDeleteModalOpen is true', () => {
    vi.mocked(usePositionsPage).mockReturnValue(
      createMockHookReturn({
        isDeleteModalOpen: true,
        selectedPositions: [mockPositions[0]],
      }),
    );

    render(<PositionsPage />);

    expect(screen.getByText('Delete Position')).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete "Software Engineer"/),
    ).toBeInTheDocument();
  });

  it('renders delete confirmation modal with plural message for multiple selections', () => {
    vi.mocked(usePositionsPage).mockReturnValue(
      createMockHookReturn({
        isDeleteModalOpen: true,
        selectedPositions: [mockPositions[0], mockPositions[1]],
      }),
    );

    render(<PositionsPage />);

    expect(screen.getByText(/Are you sure you want to delete 2 positions/)).toBeInTheDocument();
  });
});
