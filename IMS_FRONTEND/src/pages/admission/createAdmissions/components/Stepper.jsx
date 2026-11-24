import React from 'react';
import { useThemeStore } from '../../../../store';

const Stepper = ({ currentStep, completedSteps = [] }) => {
  const { isDarkMode } = useThemeStore();
  const steps = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'contact', label: 'Contact Details' },
    { id: 'education', label: 'Education' },
    { id: 'extras', label: 'Extras' },
    { id: 'fee', label: 'Fees & Plan' },
    { id: 'documents', label: 'Documents' },
    { id: 'review', label: 'Review' },
  ];

  return (
    <div className={`w-full flex items-center justify-between gap-2 p-2 sm:p-4 rounded-xl shadow-md overflow-x-auto scrollbar-thin ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isActive = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
            <div className="flex flex-col items-center text-xs sm:text-sm text-center min-w-[60px] sm:min-w-[80px] w-full">
              <div
                className={`
                  w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1 transition-colors duration-200 border-2
                  ${isCompleted ? 'bg-secondary text-white border-secondary' :
                    isActive ? 'bg-primary text-white border-primary shadow-lg ring-2 ring-primary/40' :
                      'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600'}
                `}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={`${isCompleted ? 'text-secondary' : isActive ? 'text-primary font-bold' : 'text-gray-500 dark:text-gray-400'} truncate max-w-[60px] sm:max-w-[90px]`} title={step.label}>
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="flex items-center h-8 sm:h-10">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-0.5 sm:mx-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
