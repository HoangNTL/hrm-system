import { render, screen, fireEvent } from '@testing-library/react';
import UserProfilePage from '..';
import { useMyProfilePage } from '../useUserProfilePage';

vi.mock('../useUserProfilePage', () => ({
  useMyProfilePage: vi.fn(),
}));

const mockProfile = {
  email: 'test@example.com',
  role: 'ADMIN',
  must_change_password: false,
  employee: {
    full_name: 'John Doe',
    phone: '0123456789',
    address: '123 Main St',
    gender: 'male',
    dob: '1990-01-15',
    email: 'john.doe@example.com',
    department: { name: 'IT Department' },
    position: { name: 'Software Engineer' },
    hire_date: '2023-01-01',
    work_status: 'active',
  },
};

const createMockHookReturn = (overrides = {}) => ({
  // state
  user: { role: 'ADMIN' },
  profile: mockProfile,
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
  pwdForm: {
    newPassword: '',
    confirmPassword: '',
    currentPassword: '',
  },

  // handlers
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
    vi.mocked(useMyProfilePage).mockReturnValue(createMockHookReturn());
  });

  it('renders loading state when loading is true', () => {
    vi.mocked(useMyProfilePage).mockReturnValue(createMockHookReturn({ loading: true }));

    render(<UserProfilePage />);

    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('renders profile card with user initials and name', () => {
    render(<UserProfilePage />);

    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });

  it('renders header with role and department', () => {
    render(<UserProfilePage />);

    expect(screen.getByText('Information')).toBeInTheDocument();
    expect(screen.getByText('ADMIN • IT Department')).toBeInTheDocument();
  });

  it('renders all tab buttons', () => {
    render(<UserProfilePage />);

    expect(screen.getByRole('button', { name: /personal information/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /work information/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /security/i })).toBeInTheDocument();
  });

  it('renders personal info tab content by default', () => {
    render(<UserProfilePage />);

    // Check for personal info fields (use getAllByText as some labels appear multiple times)
    expect(screen.getAllByText('Full Name').length).toBeGreaterThan(0);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getAllByText('Gender').length).toBeGreaterThan(0);
  });

  it('calls setActiveTab when clicking on tabs', () => {
    const setActiveTab = vi.fn();
    vi.mocked(useMyProfilePage).mockReturnValue(createMockHookReturn({ setActiveTab }));

    render(<UserProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: /work information/i }));
    expect(setActiveTab).toHaveBeenCalledWith('work');

    fireEvent.click(screen.getByRole('button', { name: /security/i }));
    expect(setActiveTab).toHaveBeenCalledWith('security');
  });

  it('renders work info tab when activeTab is work', () => {
    vi.mocked(useMyProfilePage).mockReturnValue(createMockHookReturn({ activeTab: 'work' }));

    render(<UserProfilePage />);

    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Position')).toBeInTheDocument();
    expect(screen.getByText('Hire Date')).toBeInTheDocument();
    expect(screen.getByText('Work Status')).toBeInTheDocument();
  });

  it('renders security tab when activeTab is security', () => {
    vi.mocked(useMyProfilePage).mockReturnValue(createMockHookReturn({ activeTab: 'security' }));

    render(<UserProfilePage />);

    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
  });

  it('shows Save Changes and Cancel buttons when editing', () => {
    vi.mocked(useMyProfilePage).mockReturnValue(createMockHookReturn({ editing: true }));

    render(<UserProfilePage />);

    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls setEditing when clicking Edit Profile button', () => {
    const setEditing = vi.fn();
    vi.mocked(useMyProfilePage).mockReturnValue(createMockHookReturn({ setEditing }));

    render(<UserProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));
    expect(setEditing).toHaveBeenCalledWith(true);
  });

  it('calls handleSaveProfile when clicking Save Changes button', () => {
    const handleSaveProfile = vi.fn();
    vi.mocked(useMyProfilePage).mockReturnValue(
      createMockHookReturn({ editing: true, handleSaveProfile }),
    );

    render(<UserProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(handleSaveProfile).toHaveBeenCalled();
  });

  it('calls handleCancelEdit when clicking Cancel button', () => {
    const handleCancelEdit = vi.fn();
    vi.mocked(useMyProfilePage).mockReturnValue(
      createMockHookReturn({ editing: true, handleCancelEdit }),
    );

    render(<UserProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(handleCancelEdit).toHaveBeenCalled();
  });

  it('calls setShowPassword when clicking Change Password button', () => {
    const setShowPassword = vi.fn();
    vi.mocked(useMyProfilePage).mockReturnValue(
      createMockHookReturn({ activeTab: 'security', setShowPassword }),
    );

    render(<UserProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: /change password/i }));
    expect(setShowPassword).toHaveBeenCalledWith(true);
  });
});
