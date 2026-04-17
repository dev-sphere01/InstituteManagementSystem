import React, { useState } from 'react';
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

const CreateEmployee = ({ onBack, onSuccess }) => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);
  const { createEmployee } = useEmployeeStore();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [basic, setBasic] = useState({});
  const [dept, setDept] = useState({});
  const [bank, setBank] = useState({});
  const [academic, setAcademic] = useState([]);
  const [experience, setExperience] = useState([]);

  const formData = { basic, dept, bank, academic, experience };

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
        await CUPLEMS_API.post('/api/EmpDeptPositions', {
          EmpID: empId,
          DeptID: dept.DeptID,
          PositionID: dept.PositionID,
          EmpTypeID: dept.EmpTypeID || null,
        }).catch(() => {}); // non-blocking
      }

      // Bank details (optional)
      if (bank.BankName || bank.AccountNumber) {
        await CUPLEMS_API.post('/api/EmpBankDetails', {
          EmpID: empId,
          BankName: bank.BankName,
          AccountNumber: bank.AccountNumber,
          IFSCCode: bank.IFSCCode,
          AccountType: bank.AccountType,
        }).catch(() => {});
      }

      // Academic (optional)
      const validAcademic = academic.filter((a) => a.Degree?.trim());
      for (const a of validAcademic) {
        await CUPLEMS_API.post('/api/EmpAcadDetails', { EmpID: empId, ...a }).catch(() => {});
      }

      // Experience (optional)
      const validExp = experience.filter((e) => e.Company?.trim());
      for (const e of validExp) {
        await CUPLEMS_API.post('/api/EmpProfDetails', { EmpID: empId, ...e }).catch(() => {});
      }

      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create employee.');
    } finally {
      setSubmitting(false);
    }
  };

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
