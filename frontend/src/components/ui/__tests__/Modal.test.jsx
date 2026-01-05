import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../Modal.jsx';

describe('Modal component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="My Modal">
        Content
      </Modal>,
    );

    expect(screen.queryByText('My Modal')).not.toBeInTheDocument();
  });

  it('renders title and children when open', () => {
    render(
      <Modal isOpen onClose={() => {}} title="My Modal">
        Content
      </Modal>,
    );

    expect(screen.getByText('My Modal')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen onClose={handleClose} title="My Modal">
        Content
      </Modal>,
    );

    // Close button has Icon "x"; use role button and click the second button in the modal
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons[buttons.length - 1];
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
