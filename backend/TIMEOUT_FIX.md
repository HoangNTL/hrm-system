# Fix timeout issue

## Problem
Line 159 in `backend/src/controllers/attendance.controller.js`:
```javascript
const shift = attendance?.shift || await attendanceService.getEmployeeShift(employeeId, shiftId);
```

`getEmployeeShift` only accepts 1 parameter (employeeId), but we're passing 2 parameters. This causes an error/timeout.

## Solution
Replace line 159 with:
```javascript
let shift = attendance?.shift;

if (!shift && shiftId) {
  shift = await attendanceService.getShiftById(shiftId);
} else if (!shift) {
  shift = await attendanceService.getEmployeeShift(employeeId);
}
```

This properly handles both cases:
- If shiftId is provided, get that specific shift
- Otherwise, get employee's default shift
