import React from 'react';

const Stepper = ({ currentStep, completedSteps = [] }) => {
  const steps = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'contact', label: 'Contact Details' },
    { id: 'education', label: 'Education' },
    { id: 'features', label: 'Features' },
    { id: 'referral', label: 'Referral' },
    { id: 'computerAccess', label: 'Computer Access' },
    { id: 'review', label: 'Review' }, // Added review step
  ];

  return (
    <div className="flex items-center justify-between gap-2 p-4 bg-background rounded-xl shadow-md overflow-x-auto">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isActive = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center gap-2">
            <div className="flex flex-col items-center text-sm text-center min-w-[80px]">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-colors duration-200 border-2
                  ${isCompleted ? 'bg-success text-white border-success' :
                    isActive ? 'bg-primary text-white border-primary shadow-lg ring-2 ring-primary/40' :
                      'bg-muted text-muted-foreground border-muted-foreground/30'}
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={`${isCompleted ? 'text-success' : isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="flex items-center h-10">
                <svg className="w-4 h-4 text-muted-foreground mx-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
