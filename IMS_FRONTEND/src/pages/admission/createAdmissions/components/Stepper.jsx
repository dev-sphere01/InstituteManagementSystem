import React from 'react';

const steps = ['Basic Info', 'Contact', 'Documents', 'Education', 'Review'];

const Stepper = ({ currentStep }) => {
  return (
    <div className="flex justify-between items-center mb-6 px-4">
      {steps.map((label, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={index} className="flex-1 flex flex-col items-center relative">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 
              ${isCompleted ? 'bg-blue-600 text-white border-blue-600' : isActive ? 'bg-white text-blue-600 border-blue-600' : 'bg-gray-300 text-gray-600 border-gray-300'}`}
            >
              {index + 1}
            </div>
            <span className="text-xs mt-2 text-center">{label}</span>
            {index < steps.length - 1 && (
              <div className="absolute top-4 right-[-50%] w-full h-1 border-t-2 border-dashed border-gray-300 z-0" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
