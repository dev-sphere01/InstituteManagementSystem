import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/API";

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
    { key: "personal", label: "Personal Info", icon: "👤" },
    { key: "academic", label: "Academic", icon: "🎓" },
    { key: "course", label: "Course", icon: "📚" },
    { key: "fee", label: "Fees", icon: "💰" },
    { key: "documents", label: "Documents", icon: "📄" },
  ];

  const InfoCard = ({
    title,
    children,
    icon,
    gradient = "from-blue-50 to-indigo-50",
  }) => (
    <div className="relative bg-white rounded-xl shadow-md border border-slate-200/50 p-4 overflow-hidden group hover:shadow-lg transition-all duration-200">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
      ></div>
      <div className="relative z-10">
        <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-100">
          {icon && (
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        <div className="space-y-2">{children}</div>
      </div>
    </div>
  );

  const InfoRow = ({ label, value, className = "", icon }) => (
    <div
      className={`flex justify-between items-center py-2 px-3 rounded-lg bg-slate-50/70 hover:bg-slate-100/70 transition-colors duration-150 ${className}`}
    >
      <div className="flex items-center space-x-2">
        {icon && <span className="text-sm">{icon}</span>}
        <span className="text-slate-600 font-medium text-sm">{label}:</span>
      </div>
      <span
        className="text-slate-800 font-semibold text-sm truncate max-w-[150px]"
        title={value}
      >
        {value || "Not provided"}
      </span>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 lg:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Compact Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 overflow-hidden sticky top-6">
              <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

              {/* Compact Header */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-4 text-white">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold mb-3">
                  {student.fullName?.charAt(0)?.toUpperCase() || "S"}
                </div>
                <h2 className="text-lg font-bold mb-1">
                  {student.fullName || "Student Name"}
                </h2>
                <p className="text-indigo-100 text-xs">
                  ID: {student.generatedRegNo}
                </p>
              </div>

              {/* Compact Info */}
              <div className="p-4 space-y-3">
                <div className="flex items-center space-x-3 p-2 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">
                    📅
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">DOB</p>
                    <p className="font-semibold text-slate-800 text-sm">
                      {new Date(student.dob).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2 rounded-lg bg-green-50 border border-green-100">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm">
                    📞
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">
                      Contact
                    </p>
                    <p className="font-semibold text-slate-800 text-sm">
                      {student.contactNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2 rounded-lg bg-purple-50 border border-purple-100">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm">
                    ✅
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Status</p>
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                        student.status === "Active"
                          ? "bg-green-500 text-white"
                          : "bg-yellow-500 text-white"
                      }`}
                    >
                      {student.status || "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Compact Action Buttons */}
              <div className="px-4 pb-4 space-y-2">
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200">
                  Edit Profile
                </button>
                <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200">
                  Print Profile
                </button>
              </div>
            </div>
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
                    className={`flex items-center space-x-1.5 px-4 py-3 font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                      activeTab === tab.key
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
              {activeTab === "personal" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <InfoCard
                    title="Basic Information"
                    icon="👤"
                    gradient="from-blue-50 to-indigo-50"
                  >
                    <InfoRow
                      label="Full Name"
                      value={student.fullName}
                      icon="👨"
                    />
                    <InfoRow
                      label="Email Address"
                      value={student.emailAddress}
                      icon="📧"
                    />
                    <InfoRow label="Gender" value={student.gender} icon="⚤" />
                    <InfoRow
                      label="Category"
                      value={student.category}
                      icon="📝"
                    />
                    <InfoRow
                      label="Contact Number"
                      value={student.contactNumber}
                      icon="📱"
                    />
                  </InfoCard>

                  <InfoCard
                    title="Address & Family"
                    icon="🏠"
                    gradient="from-emerald-50 to-teal-50"
                  >
                    <InfoRow
                      label="Address"
                      value={student.address}
                      icon="🗺️"
                    />
                    <InfoRow
                      label="Father's Name"
                      value={student.fathersName}
                      icon="👨‍💼"
                    />
                    <InfoRow
                      label="Father's Occupation"
                      value={student.fathersOccupation}
                      icon="💼"
                    />
                    <InfoRow
                      label="Mother's Name"
                      value={student.mothersName}
                      icon="👩"
                    />
                  </InfoCard>
                </div>
              )}

              {activeTab === "academic" && (
                <div className="space-y-4">
                  <InfoCard
                    title="Academic Background"
                    icon="🎓"
                    gradient="from-purple-50 to-pink-50"
                  >
                    <InfoRow
                      label="Highest Qualification"
                      value={student.highestEducationalQualification}
                      icon="🏆"
                    />
                    <InfoRow
                      label="Board/University"
                      value={student.boardOrUniversity}
                      icon="🏫"
                    />
                    <InfoRow
                      label="Year of Passing"
                      value={student.yearOfPassing}
                      icon="📅"
                    />
                    <InfoRow
                      label="Subjects Studied"
                      value={student.subjectsStudied?.join(", ")}
                      icon="📚"
                    />
                  </InfoCard>

                  {/* Compact Academic Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-xs">Academic Year</p>
                          <p className="text-xl font-bold">
                            {student.yearOfPassing || "N/A"}
                          </p>
                        </div>
                        <span className="text-xl">📊</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-100 text-xs">Subjects</p>
                          <p className="text-xl font-bold">
                            {student.subjectsStudied?.length || "N/A"}
                          </p>
                        </div>
                        <span className="text-xl">📖</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-xs">Level</p>
                          <p className="text-sm font-bold">
                            {student.highestEducationalQualification?.substring(
                              0,
                              15
                            ) || "N/A"}
                          </p>
                        </div>
                        <span className="text-xl">🎯</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "course" && (
                <InfoCard
                  title="Course Information"
                  icon="📚"
                  gradient="from-orange-50 to-red-50"
                >
                  <InfoRow
                    label="Course Applied"
                    value={student.courseApplied}
                    icon="📖"
                  />
                  <InfoRow
                    label="Preferred Learning Mode"
                    value={student.preferredModeOfLearning}
                    icon="💻"
                  />
                  <InfoRow
                    label="Referral Name"
                    value={student.referalName}
                    icon="👥"
                  />
                  <InfoRow
                    label="Referral Source"
                    value={student.referralSource}
                    icon="📢"
                  />
                </InfoCard>
              )}

              {activeTab === "fee" && (
                <div className="space-y-4">
                  <InfoCard
                    title="Fee Information"
                    icon="💰"
                    gradient="from-yellow-50 to-orange-50"
                  >
                    <InfoRow
                      label="Payment Status"
                      value={student.status}
                      icon="💳"
                    />
                    <InfoRow label="Total Fee" value="₹ --" icon="💵" />

                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs">
                          ℹ️
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-blue-800 mb-1">
                            Note
                          </p>
                          <p className="text-xs text-blue-700">
                            Fee details will be available after admission
                            confirmation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </InfoCard>

                  {/* Compact Fee Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl text-white text-center">
                      <span className="text-lg block mb-1">✅</span>
                      <p className="text-green-100 text-xs">Paid</p>
                      <p className="text-lg font-bold">₹ 0</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl text-white text-center">
                      <span className="text-lg block mb-1">⏳</span>
                      <p className="text-orange-100 text-xs">Pending</p>
                      <p className="text-lg font-bold">₹ --</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl text-white text-center">
                      <span className="text-lg block mb-1">💯</span>
                      <p className="text-blue-100 text-xs">Total</p>
                      <p className="text-lg font-bold">₹ --</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl text-white text-center">
                      <span className="text-lg block mb-1">📅</span>
                      <p className="text-purple-100 text-xs">Due</p>
                      <p className="text-sm font-bold">TBD</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "documents" && (
                <div className="space-y-4">
                  <InfoCard
                    title="Uploaded Documents"
                    icon="📄"
                    gradient="from-slate-50 to-gray-50"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        {
                          label: "Photo",
                          key: "candidatePhoto",
                          icon: "📸",
                          color: "from-blue-500 to-indigo-600",
                        },
                        {
                          label: "Signature",
                          key: "candidateSignature",
                          icon: "✍️",
                          color: "from-purple-500 to-pink-600",
                        },
                        {
                          label: "Aadhar Card",
                          key: "aadharPhoto",
                          icon: "🆔",
                          color: "from-emerald-500 to-teal-600",
                        },
                        {
                          label: "10th Marksheet",
                          key: "tenthMarksheet",
                          icon: "📋",
                          color: "from-orange-500 to-red-600",
                        },
                        {
                          label: "12th Marksheet",
                          key: "twelfthMarksheet",
                          icon: "📋",
                          color: "from-yellow-500 to-orange-600",
                        },
                        {
                          label: "Income Certificate",
                          key: "incomeCertificate",
                          icon: "📄",
                          color: "from-slate-500 to-gray-600",
                        },
                      ].map(({ label, key, icon, color }) => (
                        <div
                          key={key}
                          className={`relative p-3 rounded-xl border transition-all duration-200 ${
                            student[key]
                              ? "border-green-200 bg-green-50 hover:bg-green-100"
                              : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                          }`}
                        >
                          <div
                            className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                              student[key] ? "bg-green-500" : "bg-slate-300"
                            }`}
                          ></div>

                          <div className="flex flex-col items-center text-center space-y-2">
                            <div
                              className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center text-white text-lg`}
                            >
                              {icon}
                            </div>

                            <div>
                              <h4 className="font-semibold text-slate-800 text-sm mb-1">
                                {label}
                              </h4>
                              <p
                                className={`text-xs ${
                                  student[key]
                                    ? "text-green-600"
                                    : "text-slate-500"
                                }`}
                              >
                                {student[key] ? "✅ Available" : "❌ Missing"}
                              </p>
                            </div>

                            {student[key] ? (
                              <a
                                href={`http://localhost:4000/${student[key]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors duration-200"
                              >
                                View
                                <svg
                                  className="w-3 h-3 ml-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </a>
                            ) : (
                              <div className="px-3 py-1.5 bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg cursor-not-allowed">
                                N/A
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </InfoCard>

                  {/* Compact Document Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-xs">Uploaded</p>
                          <p className="text-2xl font-bold">
                            {
                              [
                                student.candidatePhoto,
                                student.candidateSignature,
                                student.aadharPhoto,
                                student.tenthMarksheet,
                                student.twelfthMarksheet,
                                student.incomeCertificate,
                              ].filter(Boolean).length
                            }
                            <span className="text-base"> / 6</span>
                          </p>
                        </div>
                        <span className="text-2xl">📊</span>
                      </div>
                      <div className="mt-2 bg-white/20 rounded-full h-1.5">
                        <div
                          className="bg-white rounded-full h-1.5 transition-all duration-500"
                          style={{
                            width: `${
                              ([
                                student.candidatePhoto,
                                student.candidateSignature,
                                student.aadharPhoto,
                                student.tenthMarksheet,
                                student.twelfthMarksheet,
                                student.incomeCertificate,
                              ].filter(Boolean).length /
                                6) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-600 to-green-700 p-4 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-100 text-xs">Status</p>
                          <p className="text-xl font-bold">
                            {[
                              student.candidatePhoto,
                              student.candidateSignature,
                              student.aadharPhoto,
                              student.tenthMarksheet,
                              student.twelfthMarksheet,
                              student.incomeCertificate,
                            ].filter(Boolean).length === 6
                              ? "Complete"
                              : "Pending"}
                          </p>
                        </div>
                        <span className="text-2xl">
                          {[
                            student.candidatePhoto,
                            student.candidateSignature,
                            student.aadharPhoto,
                            student.tenthMarksheet,
                            student.twelfthMarksheet,
                            student.incomeCertificate,
                          ].filter(Boolean).length === 6
                            ? "✅"
                            : "⏳"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
