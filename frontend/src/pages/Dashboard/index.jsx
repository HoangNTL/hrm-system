function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-secondary-900 dark:text-secondary-50">
          Dashboard
        </h1>
        <p className="text-body text-secondary-600 dark:text-secondary-400 mt-2">
          Welcome back! Here's what's happening with your organization today.
        </p>
      </div>

      {/* Dashboard Content */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-8">
        <div className="space-y-4">
          <h2 className="text-xl font-heading font-semibold text-secondary-900 dark:text-secondary-50">
            Dashboard Overview
          </h2>
          <p className="text-body text-secondary-700 dark:text-secondary-300">
            This is the main dashboard page of your Human Resource Management System.
          </p>
          <p className="text-body text-secondary-700 dark:text-secondary-300">
            From here, you can access all the key features including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-body text-secondary-700 dark:text-secondary-300 ml-4">
            <li>Employee management and profiles</li>
            <li>Department organization</li>
            <li>Attendance tracking and monitoring</li>
            <li>Payroll processing and reports</li>
            <li>Comprehensive analytics and insights</li>
          </ul>
          <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
            <p className="text-sm text-primary-800 dark:text-primary-300">
              <strong>Quick Tip:</strong> Use the sidebar to navigate between different sections.
              You can collapse it to get more screen space!
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Employees',
            value: '248',
            icon: '👥',
            color: 'primary',
          },
          { title: 'Departments', value: '12', icon: '🏢', color: 'accent' },
          {
            title: 'Present Today',
            value: '234',
            icon: '✅',
            color: 'success',
          },
          { title: 'On Leave', value: '14', icon: '🏖️', color: 'warning' },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600 dark:text-secondary-400 font-medium">
                  {stat.title}
                </p>
                <p className="text-3xl font-heading font-bold text-secondary-900 dark:text-secondary-50 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
