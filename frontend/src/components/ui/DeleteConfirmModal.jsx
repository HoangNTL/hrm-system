import Modal from './Modal';
import Button from './Button';
import Icon from './Icon';

function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message, loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex flex-col items-center text-center gap-3">
          <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed max-w-md">
            {message}
          </p>
        </div>

        <div className="flex justify-center gap-4 pt-2">
          <Button
            variant="danger"
            className="px-8"
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          >
            Delete
          </Button>
          <Button
            variant="outline"
            className="px-8"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteConfirmModal;
