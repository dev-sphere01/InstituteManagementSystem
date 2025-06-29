import React, { useState, useEffect } from 'react';
import BasicInfo from './components/BasicInfo';
import Contact from './components/Contact';
import Education from './components/Education';
import Extras from './components/Extras/Extras';
import Review from './components/Review';
import Stepper from './components/Stepper';
import API from './../../../services/API';

const steps = ['basic', 'contact', 'education', 'extras', 'review'];

const Admission = () => {
  const [currentStep, setCurrentStep] = useState('basic');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [formData, setFormData] = useState({});
  const [formId, setFormId] = useState(null);
  const [validationsEnabled, setValidationsEnabled] = useState(true);

  // 🔁 Fetch latest form data when navigating back to any step
  const fetchFormData = async (id) => {
    try {
      const res = await API.get(`/admissions/${id}`);
      setFormData(res);
    } catch (err) {
      console.error('Failed to fetch saved form data:', err);
    }
  };

  // 🔁 Watch for step change — if formId exists, refresh data
  useEffect(() => {
    if (formId) {
      fetchFormData(formId);
    }
  }, [currentStep]);

  const saveStepData = async (data = {}, step = currentStep, complete = false) => {
    const payload = {
      ...formData,
      ...data,
      currentStep: step,
      isCompleted: complete,
    };

    try {
      let response;
      if (formId) {
        response = await API.patch(`/admissions/${formId}`, payload); // ✅ PATCH after first save
      } else {
        response = await API.post('/admissions', payload); // ✅ POST for first time
        setFormId(response._id); // Store the form ID
      }

      setFormData(response);
      return true;
    } catch (err) {
      console.error('Failed to save step data:', err);
      alert('Error saving data');
      return false;
    }
  };

  const handleNext = async (data) => {
    const success = await saveStepData(data, currentStep);
    if (!success) return;

    const mergedData = { ...formData, ...data };
    setFormData(mergedData);

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    const nextStep = steps[steps.indexOf(currentStep) + 1];
    if (nextStep) setCurrentStep(nextStep);
  };

  const handleBack = () => {
    const idx = steps.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(steps[idx - 1]);
    }
  };

  const handleSubmit = async () => {
    const success = await saveStepData({}, 'review', true);
    if (success) {
      alert('Form submitted successfully!');
    }
  };

  const handleExit = () => {
    if (confirm('Are you sure you want to exit this form?')) {
      setCurrentStep('basic');
      setFormData({});
      setFormId(null);
      setCompletedSteps([]);
    }
  };

  return (
    <div className="w-full p-2 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm font-medium">Enable Validations (dev only):</label>
        <input
          type="checkbox"
          checked={validationsEnabled}
          onChange={(e) => setValidationsEnabled(e.target.checked)}
        />
      </div>

      <Stepper currentStep={currentStep} completedSteps={completedSteps} />

      {/* 👤 Student Info Header - visible if form is posted */}
      {formId && (
        <div className="flex justify-between items-center bg-blue-50 dark:bg-gray-800 text-sm px-4 py-2 rounded-lg mb-4 border dark:border-gray-700">
          <div className="font-medium text-blue-900 dark:text-white">
            👤 {formData.fullName || 'Unknown'} &nbsp; | &nbsp; 🆔 {formData.generatedRegNo || 'N/A'}
          </div>
          <button
            className="text-red-600 hover:text-red-800 font-semibold text-xs"
            onClick={handleExit}
          >
            Exit Form
          </button>
        </div>
      )}

      <div className="mt-1">
        {currentStep === 'basic' && (
          <BasicInfo
            onNext={handleNext}
            validationsEnabled={validationsEnabled}
            formData={formData}
          />
        )}
        {currentStep === 'contact' && (
          <Contact
            onNext={handleNext}
            onBack={handleBack}
            validationsEnabled={validationsEnabled}
            formData={formData}
          />
        )}
        {currentStep === 'education' && (
          <Education
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
            validationsEnabled={validationsEnabled}
          />
        )}
        {currentStep === 'extras' && (
          <Extras
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
            validationsEnabled={validationsEnabled}
          />
        )}
        {currentStep === 'review' && (
          <Review
            formData={formData}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default Admission;
