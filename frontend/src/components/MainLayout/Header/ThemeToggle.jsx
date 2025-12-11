import Icon from '@components/ui/Icon';

export default function ThemeToggle({ isDarkMode, onToggleTheme }) {
  return (
    <button
      onClick={onToggleTheme}
      className="p-2 rounded-lg text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Icon name="sun" className="w-6 h-6" />
      ) : (
        <Icon name="moon" className="w-6 h-6" />
      )}
    </button>
  );
}
