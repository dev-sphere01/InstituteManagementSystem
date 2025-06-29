import React, { useState } from 'react'
import BasicInfo from './components/BasicInfo'
import Contact from './components/Contact'
import Education from './components/Education'
import Extras from './components/Extras/Extras'
import Review from './components/Review'
import Stepper from './components/Stepper'

const Admission = () => {
  const [currentStep, setCurrentStep] = useState('basic');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [formData, setFormData] = useState({});

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

  return (
    <div>
      <Stepper currentStep={currentStep} completedSteps={completedSteps} />
      {currentStep === 'basic' && (
        <BasicInfo onNext={handleNext} />
      )}
      {currentStep === 'contact' && (
        <Contact onNext={handleNext} onBack={handleBack} />
      )}
      {currentStep === 'education' && (
        <Education formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />
      )}
      {currentStep === 'extras' && (
        <Extras formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />
      )}
      {currentStep === 'review' && (
        <Review formData={formData} onBack={handleBack} />
      )}
    </div>
  );
};

export default Admission;