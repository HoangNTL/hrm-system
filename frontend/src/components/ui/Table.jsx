function Table({
  columns,
  data,
  onRowClick,
  actions,
  loading = false,
  // selectedRow,
  isRowSelected,
}) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-secondary-500 dark:text-secondary-400 text-lg">No data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary-50 dark:bg-secondary-700/50 border-b border-secondary-200 dark:border-secondary-700">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-700 dark:text-secondary-300 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
            {data.map((row, rowIndex) => {
              const selected = isRowSelected ? isRowSelected(row) : false;

              return (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`
                    transition-all duration-200
                    ${
                      onRowClick
                        ? 'cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-700/30'
                        : ''
                    }
                    ${
                      selected
                        ? 'bg-primary-100 dark:bg-primary-900/30 border-l-4 border-primary-600 dark:border-primary-500 shadow-sm'
                        : ''
                    }
                  `}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        selected
                          ? 'text-secondary-900 dark:text-secondary-50 font-medium'
                          : 'text-secondary-900 dark:text-secondary-100'
                      }`}
                    >
                      {column.render
                        ? column.render(row[column.key], row, rowIndex)
                        : row[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {actions(row, rowIndex)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
