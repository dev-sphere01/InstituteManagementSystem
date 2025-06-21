import React from 'react';
import { useThemeStore } from '../../../store';

const Stepper = ({ currentStep, steps }) => {
  const { isDarkMode } = useThemeStore();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                  index + 1 <= currentStep 
                    ? (isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white') 
                    : (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-600')
                }`}
              >
                {index + 1}
              </div>
              <div className="ml-4">
                <div
                  className={`text-sm font-medium ${
                    index + 1 <= currentStep 
                      ? (isDarkMode ? 'text-purple-400' : 'text-purple-600') 
                      : (isDarkMode ? 'text-gray-500' : 'text-gray-500')
                  }`}
                >
                  {step}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-auto border-t-2 transition-all duration-500 ease-in-out ${
                  index + 1 < currentStep 
                    ? (isDarkMode ? 'border-purple-500' : 'border-purple-600') 
                    : (isDarkMode ? 'border-gray-700' : 'border-gray-300')
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Stepper; 