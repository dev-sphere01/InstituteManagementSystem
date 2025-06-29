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
  const [isLoading, setIsLoading] = useState(false);

  const steps = ['basic', 'contact', 'education', 'extras', 'review'];

  const goToStep = (step) => setCurrentStep(step);

  const saveStepData = async (data, step) => {
    try {
      const payload = {
        ...formData,
        ...data,
        currentStep: step,
        isCompleted: step === 'submitted',
      };

      let res;
      if (formId) {
        res = await API.put(`/admissions/${formId}`, payload);
      } else {
        res = await API.post('/admissions', payload);
        setFormId(res._id); // Store the form ID
      }

      setFormData(res); // Sync saved data
    } catch (error) {
      console.error('Failed to save step data', error);
    }
  };

  const handleNext = async (data) => {
    const mergedData = { ...formData, ...data };
    const currentIdx = steps.indexOf(currentStep);
    const nextStep = steps[currentIdx + 1];

    setFormData(mergedData);
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    await saveStepData(data, currentStep);

    if (nextStep) setCurrentStep(nextStep);
  };

  const handleBack = () => {
    const currentIdx = steps.indexOf(currentStep);
    if (currentIdx > 0) setCurrentStep(steps[currentIdx - 1]);
  };

  const handleSubmit = async () => {
    await saveStepData({}, 'submitted');
    alert('Form submitted successfully!');
  };

  return (
    <div className="w-full p-2 sm:p-6">
      <Stepper currentStep={currentStep} completedSteps={completedSteps} />

      <div className="mt-1">
        {currentStep === 'basic' && (
          <BasicInfo
            onNext={handleNext}
            formData={formData}
          />
        )}
        {currentStep === 'contact' && (
          <Contact
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
          />
        )}
        {currentStep === 'education' && (
          <Education
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 'extras' && (
          <Extras
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
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
