import Modal from '@components/ui/Modal';
import Icon from '@components/ui/Icon';
import Button from '@components/ui/Button';

const statusStyles = {
  active: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning-600',
  draft: 'bg-secondary-200 text-secondary-700',
  expired: 'bg-error/10 text-error',
};

const statusLabels = {
  active: 'Active',
  pending: 'Pending',
  draft: 'Draft',
  expired: 'Expired',
};

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-secondary-500">{label}</span>
      <span className="text-sm text-secondary-900 dark:text-secondary-50">{value || '-'} </span>
    </div>
  );
}

export default function ContractDetailsModal({ isOpen, onClose, contract, onEdit }) {
  if (!contract) return null;

  const statusClass = statusStyles[contract.status] || 'bg-secondary-200 text-secondary-700';
  const statusLabel = statusLabels[contract.status] || contract.status || 'Unknown';
  const salaryDisplay =
    contract.salary === null || contract.salary === undefined || contract.salary === ''
      ? '—'
      : `${Number(contract.salary).toLocaleString()}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contract Details" size="lg">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-secondary-600">Contract Code</p>
            <p className="text-xl font-semibold text-secondary-900 dark:text-secondary-50">
              {contract.code || 'N/A'}
            </p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
            <Icon name="circle" className="w-3 h-3 mr-1" />
            {statusLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Employee" value={contract.employee_name} />
          <InfoRow label="Contract Type" value={contract.contract_type} />
          <InfoRow label="Start Date" value={contract.start_date} />
          <InfoRow label="End Date" value={contract.end_date || '—'} />
          <InfoRow label="Salary" value={salaryDisplay} />
          <InfoRow label="Work Location" value={contract.work_location} />
        </div>

        <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-3">
          <p className="text-xs uppercase tracking-wide text-secondary-500 mb-1">Notes</p>
          <p className="text-sm text-secondary-800 dark:text-secondary-100 whitespace-pre-line">
            {contract.notes || 'No notes'}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={onEdit} disabled={!onEdit}>
            Edit
          </Button>
        </div>
      </div>
    </Modal>
  );
}
