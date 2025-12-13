import Icon from '@components/ui/Icon';

export default function SearchBar() {
  return (
    <div className="flex-1 max-w-xl hidden md:block">
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2.5 pl-10 rounded-lg border border-secondary-300 dark:border-secondary-600
                     bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100
                     placeholder:text-secondary-400 dark:placeholder:text-secondary-500
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     hover:border-secondary-400 dark:hover:border-secondary-500
                     transition-all duration-200"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500">
          <Icon name="search" className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
