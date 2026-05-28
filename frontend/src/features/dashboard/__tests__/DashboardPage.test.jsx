import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import DashboardPage from '../pages/DashboardPage.jsx';

vi.mock('../components/AdminDashboard.jsx', () => ({
  default: () => <div>AdminDashboard</div>,
}));

vi.mock('../components/StaffDashboard.jsx', () => ({
  default: () => <div>StaffDashboard</div>,
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
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </Provider>,
  );
}

describe('DashboardPage', () => {
  it('renders the staff dashboard for staff users', () => {
    renderPage('STAFF');
    expect(screen.getByText('StaffDashboard')).toBeInTheDocument();
  });

  it('renders the admin dashboard for admin users', () => {
    renderPage('ADMIN');
    expect(screen.getByText('AdminDashboard')).toBeInTheDocument();
  });

  it('renders the admin dashboard for HR users', () => {
    renderPage('HR');
    expect(screen.getByText('AdminDashboard')).toBeInTheDocument();
  });
});
