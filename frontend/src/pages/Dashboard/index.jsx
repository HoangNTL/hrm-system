import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/userSlice';
import StaffDashboard from './StaffDashboard';
import AdminDashboard from './AdminDashboard';

function DashboardPage() {
  const user = useSelector(selectUser);
  const isStaff = user?.role?.toUpperCase() === 'STAFF';

  // If user is staff, show staff dashboard
  if (isStaff) {
    return <StaffDashboard />;
  }

  // Otherwise show HR/Admin dashboard
  return <AdminDashboard />;
}

export default DashboardPage;
