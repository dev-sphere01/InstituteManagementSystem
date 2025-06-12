import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useThemeStore } from '../../store';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { isDarkMode } = useThemeStore();

  const studentStats = [
    {
      name: 'Enrolled Courses',
      value: '4',
      icon: '📚',
      color: 'blue',
      description: 'Active enrollments'
    },
    {
      name: 'Completed Assignments',
      value: '12',
      icon: '✅',
      color: 'green',
      description: 'This semester'
    },
    {
      name: 'Upcoming Exams',
      value: '3',
      icon: '📝',
      color: 'yellow',
      description: 'Next 30 days'
    },
    {
      name: 'Overall GPA',
      value: '3.8',
      icon: '🎯',
      color: 'purple',
      description: 'Current semester'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'assignment',
      title: 'Mathematics Assignment #3 submitted',
      time: '2 hours ago',
      icon: '📋'
    },
    {
      id: 2,
      type: 'grade',
      title: 'Physics Quiz - Grade: A',
      time: '1 day ago',
      icon: '⭐'
    },
    {
      id: 3,
      type: 'announcement',
      title: 'New course material uploaded',
      time: '2 days ago',
      icon: '📢'
    },
    {
      id: 4,
      type: 'exam',
      title: 'Chemistry exam scheduled',
      time: '3 days ago',
      icon: '📅'
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Mathematics Exam',
      date: '2024-01-15',
      time: '10:00 AM',
      type: 'exam'
    },
    {
      id: 2,
      title: 'Physics Lab Session',
      date: '2024-01-16',
      time: '2:00 PM',
      type: 'lab'
    },
    {
      id: 3,
      title: 'Chemistry Assignment Due',
      date: '2024-01-18',
      time: '11:59 PM',
      type: 'assignment'
    }
  ];

  const getStatColor = (color) => {
    const colors = {
      blue: isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-700',
      green: isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-50 text-green-700',
      yellow: isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-50 text-yellow-700',
      purple: isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-50 text-purple-700'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className={`rounded-lg p-6 ${
        isDarkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-500 to-purple-600'
      } text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="mt-2 text-blue-100">
              Ready to continue your learning journey? Here's what's happening today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-6xl opacity-20">🎓</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {studentStats.map((stat) => (
          <div
            key={stat.name}
            className={`p-6 rounded-lg border ${
              isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            } shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${getStatColor(stat.color)}`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stat.name}
                </p>
                <p className={`text-2xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.value}
                </p>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className={`rounded-lg border p-6 ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        } shadow-sm`}>
          <h2 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Recent Activities
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <span className="text-lg">{activity.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    {activity.title}
                  </p>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button className={`text-sm font-medium ${
              isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
            }`}>
              View all activities →
            </button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className={`rounded-lg border p-6 ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        } shadow-sm`}>
          <h2 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Upcoming Events
          </h2>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className={`p-3 rounded-lg border ${
                isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {event.title}
                    </p>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.type === 'exam'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : event.type === 'lab'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {event.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button className={`text-sm font-medium ${
              isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
            }`}>
              View calendar →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`rounded-lg border p-6 ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      } shadow-sm`}>
        <h2 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'View Courses', icon: '📚', href: '/courses' },
            { name: 'Assignments', icon: '📝', href: '/assignments' },
            { name: 'Grades', icon: '📊', href: '/grades' },
            { name: 'Schedule', icon: '📅', href: '/schedule' }
          ].map((action) => (
            <button
              key={action.name}
              className={`p-4 rounded-lg border text-center transition-colors ${
                isDarkMode
                  ? 'border-gray-600 hover:bg-gray-700 text-gray-200'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-sm font-medium">{action.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
