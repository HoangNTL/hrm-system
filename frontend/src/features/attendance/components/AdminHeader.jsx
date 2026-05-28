import React from 'react';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';

export default function AdminHeader({ selectedDate, today, onDateChange, onTodayClick }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Attendance management</h1>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="date"
          name="selectedDate"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-auto min-w-[180px]"
        />
        {selectedDate !== today && (
          <Button
            type="button"
            // size="sm"
            onClick={onTodayClick}
          >
            Today
          </Button>
        )}
      </div>
    </div>
  );
}
