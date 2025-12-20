import { useEffect, useState } from 'react';
import Icon from '@components/ui/Icon';
import { userService } from '@services/userService';

export default function UserStatsCard() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    locked: 0,
    never_logged_in: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await userService.getUserStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    {
      label: 'Total Users',
      value: stats.total,
      icon: 'users',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Active',
      value: stats.active,
      icon: 'check-circle',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Locked',
      value: stats.locked,
      icon: 'lock',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Never Logged In',
      value: stats.never_logged_in,
      icon: 'user-x',
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-4 animate-pulse"
          >
            <div className="h-12 bg-secondary-200 dark:bg-secondary-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${item.bg}`}>
              <Icon name={item.icon} className={`w-6 h-6 ${item.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">
                {item.value}
              </p>
              <p className="text-xs text-secondary-600 dark:text-secondary-400">
                {item.label}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
