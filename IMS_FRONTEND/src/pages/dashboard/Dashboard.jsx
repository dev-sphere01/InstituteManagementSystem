import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/API";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaCheckCircle,
  FaCalendarAlt,
  FaQuestionCircle,
  FaRupeeSign,
  FaPlusCircle,
  FaLayerGroup,
  FaFileAlt,
  FaPhoneAlt,
  FaPrint,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useThemeStore } from "../../store";

const statCards = [
  {
    label: "Total Students",
    value: 420,
    icon: <FaUsers />,
    color: "bg-blue-500",
  },
  {
    label: "Total Admissions",
    value: 350,
    icon: <FaCheckCircle />,
    color: "bg-green-500",
  },
  {
    label: "Active Batches",
    value: 12,
    icon: <FaCalendarAlt />,
    color: "bg-purple-500",
  },
  {
    label: "Pending Enquiries",
    value: 34,
    icon: <FaQuestionCircle />,
    color: "bg-orange-400",
  },
  {
    label: "Fee Collected",
    value: "₹2,56,000",
    icon: <FaRupeeSign />,
    color: "bg-green-600",
  },
];

const quickLinks = [
  { label: "Add New Student", icon: <FaPlusCircle />, path: "/dashboard/admission" },
  { label: "Create New Batch", icon: <FaLayerGroup />, path: "/dashboard/batches" },
  { label: "Define Fee Structure", icon: <FaFileAlt />, path: "/dashboard/courses" },
  { label: "Follow-Up Enquiries", icon: <FaPhoneAlt />, path: "/dashboard/enquiry/view" },
  { label: "Generate Fee Receipt", icon: <FaPrint />, path: "/dashboard/fee" },
];

const todaysEnquiries = [
  {
    name: "Ravi Kumar",
    course: "O'Level",
    phone: "9876543210",
    time: "10:30 AM",
  },
  {
    name: "Anjali Singh",
    course: "Advance Excel",
    phone: "9988776655",
    time: "11:15 AM",
  },
];

const latestAdmissions = [
  { name: "Sourabh Sharma", course: "CCC", date: "2025-06-18" },
  { name: "Neha Gupta", course: "O'Level", date: "2025-06-17" },
];

const admissionData = [
  { name: "Week 1", count: 20 },
  { name: "Week 2", count: 40 },
  { name: "Week 3", count: 35 },
  { name: "Week 4", count: 25 },
];

const courseCount = [
  { name: "O'Level", count: 5 },
  { name: "CCC", count: 3 },
  { name: "Advance Excel", count: 4 },
  { name: "Scratch", count: 2 },
  { name: "Python", count: 1 },
  { name: "Web Development", count: 2 },
  { name: "Data Science", count: 3 },
  { name: "Graphic Design", count: 2 },
  { name: "Tally", count: 1 },
  { name: "GFX & DTP", count: 2 },
  { name: "Python", count: 3 },
];

const paymentStatus = [
  { name: "Full Payment", value: 280 },
  { name: "EMI", value: 110 },
  { name: "Defaulters", value: 30 },
];

const pieColors = ["#22c55e", "#3b82f6", "#ef4444"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("month");
  const { isDarkMode } = useThemeStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await API.get('/dashboard/stats', { params: { filter } });
        if (response && response.success) {
          setStats(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [filter]);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 dark:text-slate-400 font-medium space-y-4">
        <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
        <span>Loading Dashboard Stats...</span>
      </div>
    );
  }

  const currentStatCards = [
    {
      label: "Total Students",
      value: stats?.metrics?.totalStudents ?? 0,
      icon: <FaUsers />,
      color: "bg-blue-500",
      path: "/dashboard/student-details",
    },
    {
      label: "Total Admissions",
      value: stats?.metrics?.totalAdmissions ?? 0,
      icon: <FaCheckCircle />,
      color: "bg-green-500",
      path: "/dashboard/student-details",
    },
    {
      label: "Active Batches",
      value: stats?.metrics?.activeBatches ?? 0,
      icon: <FaCalendarAlt />,
      color: "bg-purple-500",
      path: "/dashboard/batches",
    },
    {
      label: "Pending Enquiries",
      value: stats?.metrics?.pendingEnquiries ?? 0,
      icon: <FaQuestionCircle />,
      color: "bg-orange-400",
      path: "/dashboard/enquiry/view",
    },
    {
      label: "Fee Collected",
      value: `₹${Number(stats?.metrics?.feeCollected || 0).toLocaleString('en-IN')}`,
      icon: <FaRupeeSign />,
      color: "bg-green-600",
      path: "/dashboard/fee",
    },
  ];

  const currentTodaysEnquiries = stats?.todaysEnquiries || [];
  const currentLatestAdmissions = stats?.latestAdmissions || [];
  const currentAdmissionData = stats?.admissionsOverTime || [];
  const currentPaymentStatus = stats?.paymentStatus || [];
  const currentCourseCount = stats?.courseCount || [];

  return (
    <div className="p-4 space-y-6">
      {/* <h1 className="text-3xl font-bold">Institute Management Dashboard</h1> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {currentStatCards.map((card, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            onClick={() => card.path && navigate(card.path)}
            className={`p-4 text-white rounded-xl shadow-md cursor-pointer select-none transition-transform ${card.color}`}
          >
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{card.icon}</div>
              <div>
                <div className="text-lg font-semibold">{card.label}</div>
                <div className="text-2xl font-bold">{card.value}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {quickLinks.map((link, idx) => (
          <motion.button
            key={idx}
            whileHover={{ translateX: -2, translateY: -2 }}
            onClick={() => link.path && navigate(link.path)}
            className="w-52 px-4 py-2 text-sm font-medium cursor-pointer 
                 text-[#2563eb] dark:text-white 
                 bg-white dark:bg-gray-800 
                 border border-[#2563eb] dark:border-white 
                 rounded 
                 shadow-[3px_3px_0px_0px_#2563eb] dark:shadow-[3px_3px_0px_0px_#ffffff]
                 hover:bg-[#2563eb] dark:hover:bg-white 
                 hover:text-white dark:hover:text-black 
                 transition-all duration-200 
                 flex items-center justify-start"
          >
            <span className="text-lg mr-2">{link.icon}</span>
            {link.label}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Enquiries */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-md dark:shadow-lg overflow-x-auto">
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
            Today’s Enquiries
          </h2>
          <table className="table w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="text-left py-2 px-3">Name</th>
                <th className="text-left py-2 px-3">Course</th>
                <th className="text-left py-2 px-3">Phone</th>
                <th className="text-left py-2 px-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {currentTodaysEnquiries.map((e, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-200 dark:border-gray-700"
                >
                  <td className="py-2 px-3 text-gray-800 dark:text-gray-100 font-semibold">
                    {e.name}
                  </td>
                  <td className="py-2 px-3 text-gray-800 dark:text-gray-100">
                    {e.course}
                  </td>
                  <td className="py-2 px-3 text-gray-800 dark:text-gray-100">
                    {e.phone}
                  </td>
                  <td className="py-2 px-3 text-gray-800 dark:text-gray-100 font-medium">
                    {e.time}
                  </td>
                </tr>
              ))}
              {currentTodaysEnquiries.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-400 italic">No enquiries registered today</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Latest Admissions */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-md dark:shadow-lg">
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
            Latest Admissions
          </h2>
          <ul className="space-y-2">
            {currentLatestAdmissions.map((a, idx) => (
              <li
                key={idx}
                className="flex justify-between border-b pb-2 border-gray-200 dark:border-gray-700"
              >
                <div>
                  <div className="font-semibold text-gray-800 dark:text-white">
                    {a.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {a.course}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {a.date}
                </div>
              </li>
            ))}
            {currentLatestAdmissions.length === 0 && (
              <li className="text-center py-4 text-gray-400 italic">No admissions registered yet</li>
            )}
          </ul>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Line Chart - Admissions */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-md dark:shadow-lg lg:col-span-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Admissions Over Time
            </h2>
            <select
              className="select select-bordered select-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-white border-gray-300 dark:border-gray-600 cursor-pointer"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="six">Last 6 Months</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={currentAdmissionData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDarkMode ? "#444" : "#ccc"}
              />
              <XAxis dataKey="name" stroke={isDarkMode ? "#ccc" : "#333"} />
              <YAxis stroke={isDarkMode ? "#ccc" : "#333"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                  borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                  color: isDarkMode ? "#f3f4f6" : "#111827",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#4f46e5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Payment Status */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-md dark:shadow-lg lg:col-span-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Payment Status Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={currentPaymentStatus}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {currentPaymentStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <Legend
                wrapperStyle={{
                  color: isDarkMode ? "#ccc" : "#000",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                  borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                  color: isDarkMode ? "#f3f4f6" : "#111827",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart - Course Count */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-md dark:shadow-lg">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
          Available Course Count
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={currentCourseCount}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDarkMode ? "#444" : "#ccc"}
            />
            <XAxis dataKey="name" stroke={isDarkMode ? "#ccc" : "#333"} />
            <YAxis stroke={isDarkMode ? "#ccc" : "#333"} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                color: isDarkMode ? "#f3f4f6" : "#111827",
              }}
            />
            <Bar dataKey="count" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
