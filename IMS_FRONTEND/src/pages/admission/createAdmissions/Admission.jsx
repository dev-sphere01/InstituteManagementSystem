import React, { useState } from 'react';
import BasicInfo from './components/BasicInfo';
import Contact from './components/Contact';
import Education from './components/Education';
import Extras from './components/Extras/Extras';
import Review from './components/Review';
import Stepper from './components/Stepper';

const Admission = () => {
  const [currentStep, setCurrentStep] = useState('basic');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [formData, setFormData] = useState({});
  const [validationsEnabled, setValidationsEnabled] = useState(true);

  const steps = ['basic', 'contact', 'education', 'extras', 'review'];

  const goToStep = (step) => setCurrentStep(step);

  const handleNext = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    const currentIdx = steps.indexOf(currentStep);
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }
    if (currentIdx < steps.length - 1) {
      setCurrentStep(steps[currentIdx + 1]);
    }
  };

  const handleBack = () => {
    const currentIdx = steps.indexOf(currentStep);
    if (currentIdx > 0) {
      setCurrentStep(steps[currentIdx - 1]);
    }
  };

  const handleSubmit = () => {
    alert('Form submitted!');
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

      <div className="mt-1">
        {currentStep === 'basic' && (
          <BasicInfo
            onNext={handleNext}
            validationsEnabled={validationsEnabled}
          />
        )}
        {currentStep === 'contact' && (
          <Contact
            onNext={handleNext}
            onBack={handleBack}
            validationsEnabled={validationsEnabled}
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
