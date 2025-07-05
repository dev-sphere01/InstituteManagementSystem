import React from 'react';

const reports = [
  {
    icon: "📈",
    title: "Monthly Sales",
    description:
      "View and analyze your monthly sales data with detailed breakdowns by product category and region.",
  },
  {
    icon: "👤",
    title: "User Activity",
    description:
      "Track user engagement metrics including active users, session duration, and feature usage.",
  },
  {
    icon: "📦",
    title: "Inventory Status",
    description:
      "Monitor inventory levels, restocking needs, and product turnover rates.",
  },
  {
    icon: "💰",
    title: "Financial Summary",
    description:
      "Review revenue, expenses, and profit margins with quarterly and yearly comparisons.",
  },
];

const Reports = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        📊 Reports Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-md dark:shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white flex items-center gap-2">
              <span>{report.icon}</span> {report.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-5">
              {report.description}
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
              View Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
