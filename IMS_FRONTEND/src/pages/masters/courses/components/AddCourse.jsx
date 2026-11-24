import React, { useState, useEffect } from "react";
import { useThemeStore } from "../../../../store";
import API from "../../../../services/API";
import { useNotification } from "../../../../services/NotificationService";

const AddCourse = ({ onCourseCreated, onCancel, loading: parentLoading }) => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();

  const [form, setForm] = useState({
    courseCode: "",
    centreCode: "", // This will hold the centre ID
    courseName: "",
    subjects: "",
    description: "",
    duration: "",
    fee: 0,
    enableEmi: false,
    maxEmiInstallments: 3,
    emiAmount: 0,
    level: "beginner",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [centres, setCentres] = useState([]);

  useEffect(() => {
    const fetchCentres = async () => {
      try {
        const response = await API.get("/centre-codes");
        setCentres(response.data);
      } catch (error) {
        notify("Failed to fetch centres", "error");
      }
    };

    fetchCentres();
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.courseCode.trim()) errs.courseCode = "Course code is required";
    if (!form.courseName.trim()) errs.courseName = "Course name is required";
    if (!form.centreCode.trim()) errs.centreCode = "Centre code is required";
    if (form.fee <= 0) errs.fee = "Fee must be greater than 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === "checkbox" ? checked : value;

    setForm((prev) => {
      const nextForm = { ...prev, [name]: updatedValue };
      if (name === "fee" || name === "maxEmiInstallments" || name === "enableEmi") {
        const feeVal = Number(name === "fee" ? updatedValue : prev.fee) || 0;
        const emiCount = Number(name === "maxEmiInstallments" ? updatedValue : prev.maxEmiInstallments) || 1;
        nextForm.emiAmount = Math.ceil(feeVal / (emiCount || 1));
      }
      return nextForm;
    });

    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      ...form,
      subjects: form.subjects
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
    };

    try {
      const res = await API.post("/courses", payload);
      if (typeof onCourseCreated === "function") onCourseCreated(res.data.data);
      notify("Course added successfully", "success");
      if (onCancel) onCancel();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to add course", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-lg shadow ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      } p-6 max-w-2xl mx-auto`}
    >
      <h2
        className={`text-xl font-semibold mb-4 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Add New Course
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {/* Course Code */}
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Course Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="courseCode"
              value={form.courseCode}
              onChange={handleChange}
              placeholder="Enter course code"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm ${
                errors.courseCode
                  ? "border-red-500"
                  : isDarkMode
                  ? "border-gray-600 bg-gray-700 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
              disabled={isSubmitting || parentLoading}
            />
            {errors.courseCode && (
              <p className="mt-1 text-sm text-red-500">{errors.courseCode}</p>
            )}
          </div>

          <div>
            {/* Centre Code */}
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Centre Code <span className="text-red-500">*</span>
            </label>
            <select
              name="centreCode"
              value={form.centreCode}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm ${
                errors.centreCode
                  ? "border-red-500"
                  : isDarkMode
                  ? "border-gray-600 bg-gray-700 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
              disabled={isSubmitting || parentLoading}
            >
              <option value="">Select Centre</option>
              {centres?.map((centre) => (
                <option key={centre._id} value={centre._id}>
                  {centre.name} ({centre.centreCode})
                </option>
              ))}
            </select>
            {errors.centreCode && (
              <p className="mt-1 text-sm text-red-500">{errors.centreCode}</p>
            )}
          </div>

          <div>
            {/* Course Name */}
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Course Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="courseName"
              value={form.courseName}
              onChange={handleChange}
              placeholder="Enter course name"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm ${
                errors.courseName
                  ? "border-red-500"
                  : isDarkMode
                  ? "border-gray-600 bg-gray-700 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
              disabled={isSubmitting || parentLoading}
            />
            {errors.courseName && (
              <p className="mt-1 text-sm text-red-500">{errors.courseName}</p>
            )}
          </div>

          <div>
            {/* Fee */}
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Fee <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="fee"
              value={form.fee}
              onChange={handleChange}
              placeholder="e.g., 5000"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm ${errors.fee
                  ? "border-red-500"
                  : isDarkMode
                  ? "border-gray-600 bg-gray-700 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
              disabled={isSubmitting || parentLoading}
            />
            {errors.fee && <p className="mt-1 text-sm text-red-500">{errors.fee}</p>}
          </div>
        </div>

        {/* EMI / Installment Option */}
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-blue-50/50 border-blue-100'} space-y-4`}>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="enableEmi"
                checked={form.enableEmi}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Divide Fee in EMI / Installment Option
              </span>
            </label>
            {form.enableEmi && Number(form.fee) > 0 && (
              <span className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 rounded-lg">
                ₹{form.emiAmount || Math.ceil(form.fee / (form.maxEmiInstallments || 1))} / month ({form.maxEmiInstallments} EMIs)
              </span>
            )}
          </div>

          {form.enableEmi && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Max EMI Installments
                </label>
                <select
                  name="maxEmiInstallments"
                  value={form.maxEmiInstallments}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 text-sm border rounded-md shadow-sm ${
                    isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value={2}>2 Installments (Monthly)</option>
                  <option value={3}>3 Installments (Monthly)</option>
                  <option value={4}>4 Installments (Monthly)</option>
                  <option value={6}>6 Installments (Monthly)</option>
                  <option value={12}>12 Installments (Monthly)</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Amount Per EMI (₹)
                </label>
                <input
                  type="number"
                  name="emiAmount"
                  value={form.emiAmount}
                  onChange={handleChange}
                  placeholder="Auto-calculated"
                  className={`block w-full px-3 py-2 text-sm border rounded-md shadow-sm ${
                    isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {/* Duration & Level */}
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Duration
            </label>
            <input
              type="text"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              placeholder="e.g., 3 months"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
              disabled={isSubmitting || parentLoading}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Level
            </label>
            <select
              name="level"
              value={form.level}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
              disabled={isSubmitting || parentLoading}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div>
          {/* Subjects */}
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            Subjects
          </label>
          <input
            type="text"
            name="subjects"
            value={form.subjects}
            onChange={handleChange}
            placeholder="e.g., Python, Java, C++"
            className={`block w-full px-3 py-2 border rounded-md shadow-sm ${
              isDarkMode
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300 bg-white text-gray-900"
            }`}
            disabled={isSubmitting || parentLoading}
          />
        </div>

        <div>
          {/* Description */}
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Course description (optional)"
            rows={2}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm ${
              isDarkMode
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300 bg-white text-gray-900"
            }`}
            disabled={isSubmitting || parentLoading}
          />
        </div>

        <div className="flex items-center mt-2">
          {/* Active */}
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            disabled={isSubmitting || parentLoading}
          />
          <label className={`ml-2 block text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            Active
          </label>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
          {/* Actions */}
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 border rounded-md text-sm font-medium ${
              isDarkMode
                ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            }`}
            disabled={isSubmitting || parentLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || parentLoading}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
              isSubmitting || parentLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting || parentLoading ? "Adding..." : "Add Course"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCourse;
