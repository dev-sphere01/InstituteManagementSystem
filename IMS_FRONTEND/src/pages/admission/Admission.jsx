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
    <div className={`min-h-screen flex flex-col items-center justify-start ${isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      <div className="w-full flex flex-col items-center pt-10 pb-6 bg-transparent">
        <h1 className="text-3xl font-extrabold mb-2 text-purple-500 text-center tracking-tight">Admission Form</h1>
        <div className="w-full max-w-3xl">
          <Stepper currentStep={step} steps={steps} />
        </div>
      </div>
      <div className={`w-full max-w-4xl mx-auto p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}> 
        {renderStep()}
      </div>
    </div>
  );
};

export default Admission;