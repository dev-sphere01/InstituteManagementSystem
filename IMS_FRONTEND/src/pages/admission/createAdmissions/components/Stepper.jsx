import React from 'react';

const Stepper = ({ currentStep, completedSteps = [] }) => {
  const steps = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'contact', label: 'Contact Details' },
    { id: 'education', label: 'Education' },
    { id: 'features', label: 'Features' },
    { id: 'referral', label: 'Referral' },
    { id: 'computerAccess', label: 'Computer Access' },
  ];

  return (
    <div className="flex items-center justify-between gap-2 p-4 bg-gray-800 rounded-xl shadow-md overflow-x-auto">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isActive = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center gap-2">
            <div className="flex flex-col items-center text-sm text-center min-w-[80px]">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center mb-1
                  ${isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-500 text-white' :
                      'bg-gray-600 text-gray-300'}
                `}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span className={`${isCompleted ? 'text-green-400' : isActive ? 'text-white' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="w-6 h-1 bg-gray-500 rounded" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
