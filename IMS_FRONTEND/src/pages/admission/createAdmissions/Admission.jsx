import React, { useState } from 'react';
import Stepper from './components/Stepper';
import BasicInfo from './components/BasicInfo';
import Contact from './components/Contact';
import Document from './components/Documents';
import Education from './components/Education';
import Review from './components/Review';

const Admission = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [admissionId, setAdmissionId] = useState(null);
  const [formData, setFormData] = useState({});

  const handleNext = (data, newId = null) => {
    // Update form data and move to next step
    setFormData(prev => ({ ...prev, ...data }));
    if (newId) setAdmissionId(newId);
    setCurrentStep(prev => prev + 1);
  };

  const steps = [
    <BasicInfo onNext={handleNext} admissionId={admissionId} initialData={formData} />,
    <Contact onNext={handleNext} admissionId={admissionId} initialData={formData} />,
    <Document onNext={handleNext} admissionId={admissionId} initialData={formData} />,
    <Education onNext={handleNext} admissionId={admissionId} initialData={formData} />,
    <Review data={formData} admissionId={admissionId} />,
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Student Admission</h1>
      <Stepper currentStep={currentStep} />
      {steps[currentStep]}
    </div>
  );
};

export default Admission;
