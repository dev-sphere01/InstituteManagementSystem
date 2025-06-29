import React, { useState } from 'react';
import BasicInfo from './components/BasicInfo';
import Contact from './components/Contact';
import Education from './components/Education';
import Extras from './components/Extras/Extras';
import Review from './components/Review';
import Stepper from './components/Stepper';
import API from './../../../services/API';

const Admission = () => {
  const [currentStep, setCurrentStep] = useState('basic');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [formData, setFormData] = useState({});
  const [formId, setFormId] = useState(null);
  const [validationsEnabled, setValidationsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const steps = ['basic', 'contact', 'education', 'extras', 'review'];

  const goToStep = (step) => setCurrentStep(step);

  const saveStepData = async (data = {}, step = currentStep, complete = false) => {
    try {
      const payload = {
        ...formData,
        ...data,
        currentStep: step,
        isCompleted: complete,
      };

      let response;
      if (formId) {
        response = await API.put(`/admissions/${formId}`, payload); // ✅ fixed endpoint
      } else {
        response = await API.post('/admissions', payload); // ✅ fixed endpoint
        setFormId(response._id);
      }

      setFormData(response);
      return true; // ✅ signal success
    } catch (error) {
      console.error('Failed to save step data', error);
      alert('Error saving data');
      return false; // ✅ signal failure
    }
  };

  const handleNext = async (data) => {
    const mergedData = { ...formData, ...data };
    const currentIdx = steps.indexOf(currentStep);
    const nextStep = steps[currentIdx + 1];

    // ✅ Save and proceed only if successful
    const success = await saveStepData(data, currentStep);
    if (!success) return;

    setFormData(mergedData);
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    if (nextStep) setCurrentStep(nextStep);
  };

  const handleBack = () => {
    const currentIdx = steps.indexOf(currentStep);
    if (currentIdx > 0) {
      setCurrentStep(steps[currentIdx - 1]);
    }
  };

  const handleSubmit = async () => {
    const success = await saveStepData({}, 'review', true);
    if (success) {
      alert('Form submitted successfully!');
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

      {/* Header for student name + regNo after step 1 */}
      {currentStep !== 'basic' && (
        <div className="flex justify-between items-center bg-blue-50 dark:bg-gray-800 text-sm px-4 py-2 rounded-lg mb-4 border dark:border-gray-700">
          <div className="font-medium text-blue-900 dark:text-white">
            👤 {formData.fullName || 'Unknown'} &nbsp; | &nbsp; 🆔 {formData.generatedRegNo || 'N/A'}
          </div>
          <button
            className="text-red-600 hover:text-red-800 font-semibold text-xs"
            onClick={() => {
              if (confirm('Are you sure you want to exit this form?')) {
                setCurrentStep('basic');
                setFormData({});
                setFormId(null);
                setCompletedSteps([]);
              }
            }}
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
