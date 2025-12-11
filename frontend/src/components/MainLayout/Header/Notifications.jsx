import Icon from '@components/ui/Icon';

export default function Notifications() {
  return (
    <button
      className="p-2 rounded-lg text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors relative"
      aria-label="Notifications"
    >
      <Icon name="bell" className="w-6 h-6" />
      <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
    </button>
  );
}
