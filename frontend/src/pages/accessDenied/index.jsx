import { useNavigate, Link } from 'react-router-dom';
import Button from '@components/ui/Button';
import Icon from '@components/ui/Icon';

export default function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-secondary-50 dark:bg-secondary-900">
      <div className="text-center max-w-md px-6">
        {/* Icon / Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30">
            <Icon name="shield-alert" className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-heading font-bold text-secondary-900 dark:text-secondary-100 mb-4">
          Access Denied
        </h1>
        <p className="text-lg text-secondary-600 dark:text-secondary-400 mb-8">
          You don&apos;t have permission to access this page. Please go back or return to the dashboard.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            <Icon name="arrow-left" className="w-5 h-5" />
            Go Back
          </Button>
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button variant="primary" fullWidth>
              <Icon name="house" className="w-5 h-5" />
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-8 pt-8 border-t border-secondary-200 dark:border-secondary-700">
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            If you believe this is a mistake, please contact your administrator or HR department.
          </p>
        </div>
      </div>
    </div>
  );
}
