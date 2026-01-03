import React from 'react';

export default function SearchFilter({ searchText, onSearchChange, selectedDepartment, onDepartmentChange, departments }) {
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6">
      <input
        type="text"
        placeholder="Search employees (name or email)..."
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={selectedDepartment}
        onChange={(e) => onDepartmentChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:min-w-[200px]"
      >
        <option value="">All departments</option>
        {departments.map(dept => (
          <option key={dept} value={dept}>{dept}</option>
        ))}
      </select>
    </div>
  );
}
