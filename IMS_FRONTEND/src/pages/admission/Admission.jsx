import React, { useState } from 'react';
import Stepper from './components/Stepper';
import BasicInfo from './components/BasicInfo';
import Contact from './components/Contact';
import Education from './components/Education';
import Documents from './components/Documents';
import Review from './components/Review';
import { getAdmissionStyleClasses } from './styleClasses';
import { useThemeStore } from '../../store';

const Admission = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const { isDarkMode } = useThemeStore();
  const { titleClass } = getAdmissionStyleClasses();

  const steps = ['Basic Info', 'Contact', 'Education', 'Documents', 'Review'];

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const submitForm = () => {
    // Logic to submit formData
    console.log('Form Data Submitted:', formData);
    alert('Admission form submitted successfully!');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <BasicInfo formData={formData} setFormData={setFormData} nextStep={nextStep} />;
      case 2:
        return <Contact formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 3:
        return <Education formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 4:
        return <Documents formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 5:
        return <Review formData={formData} prevStep={prevStep} submitForm={submitForm} />;
      default:
        return <BasicInfo formData={formData} setFormData={setFormData} nextStep={nextStep} />;
    }
  };

  return (
    <div className={`container mx-auto p-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        <h1 className={titleClass}>Admission Form</h1>
        <div className="max-w-4xl mx-auto">
            <Stepper currentStep={step} steps={steps} />
            <div className="mt-8">
                {renderStep()}
            </div>
        </div>
    </div>
  );
};

export default Admission;