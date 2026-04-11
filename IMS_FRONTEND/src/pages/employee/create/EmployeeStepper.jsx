import React from 'react';
import { useThemeStore } from '../../../store';

const steps = [
  { label: 'Basic Details',   required: true },
  { label: 'Dept & Position', required: true },
  { label: 'Bank Details',    required: false },
  { label: 'Academic',        required: false },
  { label: 'Experience',      required: false },
  { label: 'Review',          required: false },
];

const EmployeeStepper = ({ currentStep }) => {
  const { isDarkMode } = useThemeStore();

  return (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
      {steps.map((step, idx) => {
        const done   = idx < currentStep;
        const active = idx === currentStep;

        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center min-w-[72px]">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-200
                  ${done
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                    : active
                    ? 'border-blue-500 text-blue-600 bg-blue-50 shadow ring-2 ring-blue-200'
                    : isDarkMode
                    ? 'border-gray-600 text-gray-500 bg-gray-800'
                    : 'border-gray-300 text-gray-400 bg-white'
                  }`}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : idx + 1}
              </div>
              <span className={`text-xs mt-1.5 text-center font-medium leading-tight
                ${active
                  ? 'text-blue-600'
                  : done
                  ? isDarkMode ? 'text-blue-400' : 'text-blue-500'
                  : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                {step.label}
                {!step.required && (
                  <span className={`block text-[10px] font-normal ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>
                    optional
                  </span>
                )}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 rounded transition-colors duration-300 ${
                  idx < currentStep
                    ? 'bg-blue-500'
                    : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default EmployeeStepper;
