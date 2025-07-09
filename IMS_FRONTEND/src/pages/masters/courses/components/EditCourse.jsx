import React, { useState, useEffect } from "react";
import API from "../../../../services/API";

const EditCourse = ({ course, onCourseUpdated, onCancel, loading: parentLoading }) => {
  const [form, setForm] = useState({
    courseCode: course.courseCode || "",
    centreCode: course.centreCode?._id || "",
    courseName: course.courseName || "",
    subjects: Array.isArray(course.subjects) ? course.subjects.join(", ") : "",
    description: course.description || "",
    duration: course.duration || "",
    fee: course.fee || 0,
    level: course.level || "beginner",
    isActive: course.isActive || true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [centres, setCentres] = useState([]);

  useEffect(() => {
    const fetchCentres = async () => {
      try {
        const response = await API.get("/centre-codes");
        console.log("Fetched Centres:", response.data);
        setCentres(response.data);
      } catch (error) {
        console.error("Failed to fetch centres:", error);
        // Optionally, display an error notification to the user
      }
    };

    fetchCentres();
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.courseCode.trim()) errs.courseCode = "Course code is required";
    if (!form.courseName.trim()) errs.courseName = "Course name is required";
    if (!form.centreCode) errs.centreCode = "Centre code is required";
    if (form.fee <= 0) errs.fee = "Fee must be greater than 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onCourseUpdated({...form, _id: course._id}); // Send as-is (string), backend will convert
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg shadow-md p-6 bg-white dark:bg-gray-800 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Course
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Update course details and status
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Course Code */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Course Code <span className="text-red-500">*</span>
            </label>
            <input
              name="courseCode"
              value={form.courseCode}
              onChange={handleChange}
              placeholder="Enter course code"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.courseCode
                  ? "border-red-600"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            />
            {errors.courseCode && (
              <p className="mt-1 text-sm text-red-600">{errors.courseCode}</p>
            )}
          </div>

          {/* Course Name */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Course Name <span className="text-red-500">*</span>
            </label>
            <input
              name="courseName"
              value={form.courseName}
              onChange={handleChange}
              placeholder="Enter course name"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.courseName
                  ? "border-red-600"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            />
            {errors.courseName && (
              <p className="mt-1 text-sm text-red-600">{errors.courseName}</p>
            )}
          </div>

          {/* Centre Code */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Centre Code <span className="text-red-500">*</span>
            </label>
            <select
              name="centreCode"
              value={form.centreCode}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.centreCode
                  ? "border-red-600"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            >
              <option value="">Select Centre</option>
              {centres.map((centre) => (
                <option key={centre._id} value={centre._id}>
                  {centre.name} ({centre.centreCode})
                </option>
              ))}
            </select>
            {errors.centreCode && (
              <p className="mt-1 text-sm text-red-600">{errors.centreCode}</p>
            )}
          </div>
          {/* Fee */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Fee
            </label>
            <input
              name="fee"
              value={form.fee}
              onChange={handleChange}
              placeholder="Enter course fee"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Duration
            </label>
            <input
              name="duration"
              value={form.duration}
              onChange={handleChange}
              placeholder="e.g. 6 months"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Level
            </label>
            <select
              name="level"
              value={form.level}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Subjects */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Subjects
          </label>
          <input
            name="subjects"
            value={form.subjects}
            onChange={handleChange}
            placeholder="e.g. Math, Physics, Chemistry"
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter course description"
            rows={3}
            className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Status */}
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Active
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-md font-medium transition-colors bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || parentLoading}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              isSubmitting || parentLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting || parentLoading ? "Updating..." : "Update Course"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCourse;
