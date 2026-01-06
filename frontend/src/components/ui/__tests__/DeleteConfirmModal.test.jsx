import { render, screen, fireEvent } from '@testing-library/react';
import DeleteConfirmModal from '../DeleteConfirmModal.jsx';

describe('DeleteConfirmModal component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<DeleteConfirmModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
  });

  it('renders title and message when open', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
  });

  it('renders Delete and Cancel buttons', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onConfirm when Delete button is clicked', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when loading is true', () => {
    render(<DeleteConfirmModal {...defaultProps} loading={true} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    expect(deleteButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('enables buttons when loading is false', () => {
    render(<DeleteConfirmModal {...defaultProps} loading={false} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    expect(deleteButton).not.toBeDisabled();
    expect(cancelButton).not.toBeDisabled();
  });
});
