import { useNavigate, Link } from "react-router-dom";
import Button from "@components/ui/Button";
import Icon from "@components/ui/Icon";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-secondary-50 dark:bg-secondary-900">
      <div className="text-center max-w-md px-6">
        {/* 404 Icon/Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary-600 dark:text-primary-400">
            404
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-heading font-bold text-secondary-900 dark:text-secondary-100 mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-secondary-600 dark:text-secondary-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
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
            Need help?{" "}
            <Link
              to="/settings"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
