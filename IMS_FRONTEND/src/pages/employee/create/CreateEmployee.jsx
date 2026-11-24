import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../../store';
import useEmployeeStore from '../../../store/useEmployeeStore';
import CUPLEMS_API from '../../../services/CUPLEMS_API';
import { getEmsStyles } from '../emsStyles';
import EmployeeStepper from './EmployeeStepper';
import Step1BasicDetails from './steps/Step1BasicDetails';
import Step2DeptPosition from './steps/Step2DeptPosition';
import Step3BankDetails from './steps/Step3BankDetails';
import Step4AcademicDetails from './steps/Step4AcademicDetails';
import Step5Experience from './steps/Step5Experience';
import StepReview from './steps/StepReview';

const DRAFT_KEY = 'ims_create_employee_draft';

const CreateEmployee = ({ onBack, onSuccess }) => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);
  const { createEmployee } = useEmployeeStore();

  // Helper to parse saved draft securely
  const getInitialDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load employee draft from storage:', e);
    }
    return null;
  };

  const initialDraft = getInitialDraft();

  const [step, setStep] = useState(initialDraft?.step || 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [basic, setBasic] = useState(initialDraft?.basic || {});
  const [dept, setDept] = useState(initialDraft?.dept || {});
  const [bank, setBank] = useState(initialDraft?.bank || {});
  const [academic, setAcademic] = useState(initialDraft?.academic || []);
  const [experience, setExperience] = useState(initialDraft?.experience || []);

  const formData = { basic, dept, bank, academic, experience };

  // Save progress automatically to localStorage on every change
  useEffect(() => {
    try {
      const draftData = { step, basic, dept, bank, academic, experience };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    } catch (e) {
      console.error('Failed to save employee draft:', e);
    }
  }, [step, basic, dept, bank, academic, experience]);

  const handleClearDraft = () => {
    if (window.confirm('Are you sure you want to clear the saved form draft and start fresh?')) {
      localStorage.removeItem(DRAFT_KEY);
      setStep(0);
      setBasic({});
      setDept({});
      setBank({});
      setAcademic([]);
      setExperience([]);
      setError('');
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      // Build employee payload matching CUPLEMS Employee model
      const payload = {
        FirstName: basic.FirstName,
        LastName: basic.LastName || '',
        PersonalEmail: basic.PersonalEmail || '',
        WorkEmail: dept.WorkEmail || '',
        PhoneNumber: basic.PhoneNumber,
        Address: basic.Address || '',
        DateOfBirth: basic.DateOfBirth || null,
        Gender: basic.Gender || '',
        DateOfJoining: dept.DateOfJoining,
        LocationID: dept.LocationID,
        IsActive: true,
        OBStatus: false,
        RoleID: 3, // default employee role — adjust as needed
        EmergencyContactNumber: basic.EmergencyContactNumber || '',
      };

      // Create employee
      const { data: newEmp } = await CUPLEMS_API.post('/api/Employees', payload);
      const empId = newEmp.EmpID;

      // Assign dept/position
      if (dept.DeptID && dept.PositionID) {
        await CUPLEMS_API.post('/api/EmpDeptPos', {
          EmpID: empId,
          DeptID: dept.DeptID,
          PositionID: dept.PositionID,
          EmpTypeID: dept.EmpTypeID || null,
        }).catch(() => {}); // non-blocking
      }

      // Bank details (optional)
      if (bank.BankName || bank.AccountNumber) {
        const bankFormData = new FormData();
        bankFormData.append('EmpID', empId);
        bankFormData.append('BankName', bank.BankName || '');
        bankFormData.append('AccountNumber', bank.AccountNumber || '');
        bankFormData.append('IFSCCode', bank.IFSCCode || '');
        bankFormData.append('BranchName', bank.BranchName || bank.AccountType || '');
        await CUPLEMS_API.post('/api/EmpBankDetails', bankFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }).catch(() => {});
      }

      // Academic (optional)
      const validAcademic = academic.filter((a) => a.Degree?.trim());
      for (const a of validAcademic) {
        await CUPLEMS_API.post('/api/EmpAcadDetails', {
          EmpID: empId,
          Degree: a.Degree,
          Qualification: a.Degree,
          Institution: a.Institution,
          YearOfPassing: a.YearOfPassing ? String(a.YearOfPassing) : '',
          Grade: a.Percentage ? String(a.Percentage) : '',
        }).catch(() => {});
      }

      // Experience (optional)
      const validExp = experience.filter((e) => e.Company?.trim());
      for (const e of validExp) {
        await CUPLEMS_API.post('/api/EmpProfDetails', {
          EmpID: empId,
          PreviousCompany: e.Company,
          PreviousPosition: e.JobTitle,
          PreviousExperience: e.Description || '',
        }).catch(() => {});
      }

      // Clear draft after successful creation
      localStorage.removeItem(DRAFT_KEY);

      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create employee.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasDraftData = Boolean(
    basic.FirstName || basic.PhoneNumber || dept.LocationID || bank.BankName || academic.length || experience.length
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={styles.btnGhost(isDarkMode)}>
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back
          </button>
          <div>
            <h1 className={styles.stepTitle}>Onboard New Employee</h1>
            <p className={styles.stepSubtitle}>Follow the steps to register a new staff member.</p>
          </div>
        </div>

        {hasDraftData && (
          <button
            onClick={handleClearDraft}
            className="text-xs px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all font-medium flex items-center gap-1.5"
            title="Clear all saved progress and start over"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Discard Draft
          </button>
        )}
      </div>

      <div className={styles.sectionCard}>
        <div className="mb-10 px-2">
          <EmployeeStepper currentStep={step} />
        </div>

        <div className="min-h-[400px]">
          {error && <div className={styles.alertError + " mb-8"}>{error}</div>}

          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {step === 0 && (
              <Step1BasicDetails data={basic} onChange={setBasic} onNext={() => setStep(1)} />
            )}
            {step === 1 && (
              <Step2DeptPosition data={dept} onChange={setDept} onNext={() => setStep(2)} onBack={() => setStep(0)} />
            )}
            {step === 2 && (
              <Step3BankDetails data={bank} onChange={setBank} onNext={() => setStep(3)} onBack={() => setStep(1)} onSkip={() => setStep(3)} />
            )}
            {step === 3 && (
              <Step4AcademicDetails data={academic} onChange={setAcademic} onNext={() => setStep(4)} onBack={() => setStep(2)} onSkip={() => setStep(4)} />
            )}
            {step === 4 && (
              <Step5Experience data={experience} onChange={setExperience} onNext={() => setStep(5)} onBack={() => setStep(3)} onSkip={() => setStep(5)} />
            )}
            {step === 5 && (
              <StepReview formData={formData} onBack={() => setStep(4)} onSubmit={handleSubmit} submitting={submitting} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEmployee;
