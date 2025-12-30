import Icon from './Icon';

function Pagination({ currentPage, totalPages, onPageChange, totalItems }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2 bg-white dark:bg-secondary-800">
      {/* Page Info */}
      <div className="text-sm text-secondary-700 dark:text-secondary-300">
        {totalItems !== undefined && (
          <span>
            Showing page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
            {' • '}
            <span className="font-medium">{totalItems}</span> total records
          </span>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-white dark:bg-secondary-700 border border-secondary-300 dark:border-secondary-600 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <div className="flex items-center gap-1">
            <Icon name="chevron-left" className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </div>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm text-secondary-500">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`
                  px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${
                    currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'text-secondary-700 dark:text-secondary-300 bg-white dark:bg-secondary-700 border border-secondary-300 dark:border-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-600'
                  }
                `}
              >
                {page}
              </button>
            ),
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-white dark:bg-secondary-700 border border-secondary-300 dark:border-secondary-600 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <div className="flex items-center gap-1">
            <span className="hidden sm:inline">Next</span>
            <Icon name="chevron-right" className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
}

export default Pagination;
