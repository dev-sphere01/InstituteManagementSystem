import React from 'react';
import { useThemeStore } from '../../../store';

const Stepper = ({ currentStep, steps }) => {
  const { isDarkMode, colors } = useThemeStore();
  const accent = isDarkMode ? '#A78BFA' : '#8B5CF6'; // theme accent purple
  const base = isDarkMode ? '#374151' : '#E5E7EB'; // gray for inactive

  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        return (
          <div key={label} className="flex-1 flex items-center min-w-0">
            {/* Step Circle */}
            <div className="flex flex-col items-center min-w-0">
              <div
                className={`flex items-center justify-center rounded-full border-2 transition-colors duration-200 shadow-sm ${isCompleted ? '' : isActive ? 'ring-2 ring-purple-400' : ''}`}
                style={{
                  width: 32,
                  height: 32,
                  background: isCompleted ? accent : isActive ? '#fff' : base,
                  borderColor: isCompleted || isActive ? accent : base,
                  color: isCompleted ? '#fff' : isActive ? accent : base,
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="#fff" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{stepNum}</span>
                )}
              </div>
              <span className={`mt-2 text-xs font-semibold truncate text-center ${isActive ? 'text-purple-500' : isCompleted ? 'text-purple-400' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
            </div>
            {/* Connector */}
            {idx !== steps.length - 1 && (
              <div style={{ height: 2, background: isCompleted ? accent : base }} className="flex-1 mx-1 rounded-full"></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper; 