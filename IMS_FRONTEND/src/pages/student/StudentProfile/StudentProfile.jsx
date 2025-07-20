import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../services/API";
import { User, GraduationCap, BookOpen, Wallet, FileText } from 'lucide-react';
import InfoCard from "./components/TabContents/components/InfoCard";
import InfoRow from "./components/TabContents/components/InfoRow";
import Summary from "./components/Summary/Summary";
import TabContents from "./components/TabContents/TabContents";

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await API.get(`/admissions/${id}`);
        setStudent(res);
        console.log("Student loaded successfully", res.data);
      } catch (err) {
        console.error("Failed to load student", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-slate-700 font-medium">
            Loading student profile...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (!student) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Student Not Found
          </h3>
          <p className="text-slate-600">
            The requested student profile could not be found.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "personal", label: "Personal Info", icon: <User size={18} /> },
    { key: "academic", label: "Academic", icon: <GraduationCap size={18} /> },
    { key: "course", label: "Course", icon: <BookOpen size={18} /> },
    { key: "fee", label: "Fees", icon: <Wallet size={18} /> },
    { key: "documents", label: "Documents", icon: <FileText size={18} /> },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 lg:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Compact Profile Summary */}
          <div className="lg:col-span-1">
            <Summary student={student} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">

            {/* Compact Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-4">
              <div className="flex overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center space-x-1.5 px-4 py-3 font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${activeTab === tab.key
                      ? "text-indigo-600 border-indigo-600 bg-indigo-50"
                      : "text-slate-600 border-transparent hover:text-slate-800 hover:bg-slate-50"
                      }`}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span className="text-sm">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              <TabContents
                student={student}
                InfoCard={InfoCard}
                InfoRow={InfoRow}
                activeTab={activeTab}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
