import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import AttendancePage from '../pages/AttendancePage.jsx';

vi.mock('../components/StaffAttendanceView.jsx', () => ({
  default: () => <div>StaffAttendanceView</div>,
}));

vi.mock('../components/AdminAttendanceView.jsx', () => ({
  default: () => <div>AdminAttendanceView</div>,
}));

const mockStore = (initialState) => ({
  getState: () => initialState,
  subscribe: () => () => {},
  dispatch: () => {},
});

function renderPage(role) {
  const store = mockStore({ user: { user: { role } } });
  return render(
    <Provider store={store}>
      <AttendancePage />
    </Provider>,
  );
}

describe('AttendancePage', () => {
  it('renders the staff attendance view for staff users', () => {
    renderPage('STAFF');
    expect(screen.getByText('StaffAttendanceView')).toBeInTheDocument();
  });

  it('renders the admin attendance view for admin users', () => {
    renderPage('ADMIN');
    expect(screen.getByText('AdminAttendanceView')).toBeInTheDocument();
  });

  it('renders the admin attendance view for HR users', () => {
    renderPage('HR');
    expect(screen.getByText('AdminAttendanceView')).toBeInTheDocument();
  });
});
