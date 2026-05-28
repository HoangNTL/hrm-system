import { fireEvent, render, screen } from '@testing-library/react';

import UserProfilePage from '../pages/UserProfilePage.jsx';
import { useUserProfile } from '../hooks/useUserProfile.js';

vi.mock('../hooks/useUserProfile.js', () => ({
  useUserProfile: vi.fn(),
}));

const createMockHookReturn = (overrides = {}) => ({
  user: { role: 'ADMIN' },
  profile: {
    employee: {
      full_name: 'John Doe',
      department: { name: 'IT Department' },
      position: { name: 'Software Engineer' },
      gender: 'male',
      email: 'john.doe@example.com',
      phone: '0123456789',
      address: '123 Main St',
      dob: '1990-01-15',
      hire_date: '2023-01-01',
      work_status: 'active',
    },
    must_change_password: false,
  },
  loading: false,
  activeTab: 'personal',
  editing: false,
  editData: {
    full_name: 'John Doe',
    phone: '0123456789',
    address: '123 Main St',
    gender: 'male',
    dob: '1990-01-15',
  },
  showPassword: false,
  showCurrentPassword: false,
  showNewPassword: false,
  showConfirmPassword: false,
  pwdForm: { newPassword: '', confirmPassword: '', currentPassword: '' },
  setActiveTab: vi.fn(),
  setEditing: vi.fn(),
  setShowPassword: vi.fn(),
  handleSaveProfile: vi.fn(),
  handleCancelEdit: vi.fn(),
  handleEditDataChange: vi.fn(),
  handleChangePassword: vi.fn(),
  handlePasswordFormChange: vi.fn(),
  togglePasswordVisibility: vi.fn(),
  getInitials: vi.fn(() => 'JD'),
  ...overrides,
});

describe('UserProfilePage', () => {
  beforeEach(() => {
    vi.mocked(useUserProfile).mockReturnValue(createMockHookReturn());
  });

  it('renders loading state', () => {
    vi.mocked(useUserProfile).mockReturnValue(createMockHookReturn({ loading: true }));
    render(<UserProfilePage />);
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('renders header and personal information', () => {
    render(<UserProfilePage />);
    expect(screen.getByText('Information')).toBeInTheDocument();
    expect(screen.getByText('ADMIN • IT Department')).toBeInTheDocument();
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
  });

  it('switches tabs through setActiveTab', () => {
    const setActiveTab = vi.fn();
    vi.mocked(useUserProfile).mockReturnValue(createMockHookReturn({ setActiveTab }));
    render(<UserProfilePage />);
    fireEvent.click(screen.getByRole('button', { name: /work information/i }));
    fireEvent.click(screen.getByRole('button', { name: /security/i }));
    expect(setActiveTab).toHaveBeenCalledWith('work');
    expect(setActiveTab).toHaveBeenCalledWith('security');
  });
});
