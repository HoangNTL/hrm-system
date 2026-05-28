import React from 'react';
import SearchBar from '@components/ui/SearchBar';
import Select from '@components/ui/Select';

export default function SearchFilter({
  searchText,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  departments,
}) {
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6">
      <SearchBar
        value={searchText}
        onChange={onSearchChange}
        placeholder="Search employees (name or email)..."
        className="flex-1"
      />

      <Select
        value={selectedDepartment}
        onChange={onDepartmentChange}
        options={[
          { value: '', label: 'All departments' },
          ...departments.map((dept) => ({ value: dept, label: dept })),
        ]}
        className="md:min-w-[200px]"
      />
    </div>
  );
}
