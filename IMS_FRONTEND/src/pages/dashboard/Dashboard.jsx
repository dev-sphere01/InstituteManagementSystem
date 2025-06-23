import React, { useState } from "react";
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

const statCards = [
  { label: "Total Students", value: 420, icon: <FaUsers />, color: "bg-blue-500" },
  { label: "Total Admissions", value: 350, icon: <FaCheckCircle />, color: "bg-green-500" },
  { label: "Active Batches", value: 12, icon: <FaCalendarAlt />, color: "bg-purple-500" },
  { label: "Pending Enquiries", value: 34, icon: <FaQuestionCircle />, color: "bg-orange-400" },
  { label: "Fee Collected", value: "₹2,56,000", icon: <FaRupeeSign />, color: "bg-green-600" },
];

const quickLinks = [
  { label: "Add New Student", icon: <FaPlusCircle /> },
  { label: "Create New Batch", icon: <FaLayerGroup /> },
  { label: "Define Fee Structure", icon: <FaFileAlt /> },
  { label: "Follow-Up Enquiries", icon: <FaPhoneAlt /> },
  { label: "Generate Fee Receipt", icon: <FaPrint /> },
];

const todaysEnquiries = [
  { name: "Ravi Kumar", course: "O'Level", phone: "9876543210", time: "10:30 AM" },
  { name: "Anjali Singh", course: "Advance Excel", phone: "9988776655", time: "11:15 AM" },
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
  const [filter, setFilter] = useState("month");

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">Institute Management Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            className={`p-4 text-white rounded-xl shadow-md ${card.color}`}
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
            className="w-52 px-4 py-2 text-sm font-medium text-[#2563eb] bg-white-100 border border-[#2563eb] rounded shadow-[3px_3px_0px_0px_#2563eb] hover:bg-[#2563eb] transition-all duration-200 flex items-center justify-start"
          >
            <span className="text-lg mr-2">{link.icon}</span>
            {link.label}
          </motion.button>
        ))}
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Enquiries */}
        <div className="bg-white rounded-xl p-4 shadow-md overflow-x-auto">
          <h2 className="text-xl font-semibold mb-2">Today’s Enquiries</h2>
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Course</th>
                <th>Phone</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {todaysEnquiries.map((e, idx) => (
                <tr key={idx}>
                  <td>{e.name}</td>
                  <td>{e.course}</td>
                  <td>{e.phone}</td>
                  <td>{e.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Latest Admissions */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-2">Latest Admissions</h2>
          <ul className="space-y-2">
            {latestAdmissions.map((a, idx) => (
              <li key={idx} className="flex justify-between border-b pb-2">
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-sm text-gray-500">{a.course}</div>
                </div>
                <div className="text-sm text-gray-600">{a.date}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Line Chart - Admissions */}
        <div className="bg-white rounded-xl p-4 shadow-md lg:col-span-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Admissions Over Time</h2>
            <select
              className="select select-bordered select-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="six">Last 6 Months</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={admissionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Payment Status */}
        <div className="bg-white rounded-xl p-4 shadow-md lg:col-span-4">
          <h2 className="text-xl font-semibold mb-4">Payment Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={paymentStatus} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                {paymentStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      </div> */}


      {/* Bar Chart - Course Count */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <h2 className="text-xl font-semibold mb-2">Available Course Count</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={courseCount}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
