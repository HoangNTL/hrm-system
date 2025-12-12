import Modal from './Modal';
import Button from './Button';
import Icon from './Icon';

function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message, loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
            <Icon name="alert-triangle" className="w-5 h-5 text-danger-600 dark:text-danger-400" />
          </div>
          <p className="text-secondary-700 dark:text-secondary-300">{message}</p>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            variant="danger"
            fullWidth
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          >
            Delete
          </Button>
          <Button variant="outline" fullWidth onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteConfirmModal;
