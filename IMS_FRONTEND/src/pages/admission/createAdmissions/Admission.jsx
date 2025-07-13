import React, { useState, useEffect } from 'react';
import BasicInfo from './components/BasicInfo';
import Contact from './components/Contact';
import Education from './components/Education';
import Extras from './components/Extras/Extras';
import Documents from './components/Documents';
import Review from './components/Review';
import Stepper from './components/Stepper';
import API from './../../../services/API';
import { useNotification } from './../../../services/NotificationService';

const steps = ['basic', 'contact', 'education', 'extras', 'documents', 'review'];


const Admission = () => {
  const [currentStep, setCurrentStep] = useState('basic');
  const [completedSteps, setCompletedSteps] = useState([]);
  const notify = useNotification();
  const [formData, setFormData] = useState({
    // Basic Info
    formNo: '',
    centerCode: '',
    employeeId: '',
    otherInfo: '',
    generatedRegNo: '',
    fullName: '',
    dob: '',
    gender: '',
    category: '',
    aadharNo: '',
    religion: '',

    // Contact Info
    contactNumber: '',
    alternateContactNumber: '',
    emailAddress: '',
    state: '',
    district: '',
    address: '',
    pinCode: '',
    fathersName: '',
    fathersOccupation: '',
    fathersJobRole: '',
    fathersDepartmentOrCompany: '',
    mothersName: '',
    mothersOccupation: '',
    mothersJobRole: '',
    mothersDepartmentOrCompany: '',
    guardianName: '',
    guardianRelation: '',
    guardianContactNumber: '',

    // Document Uploads
    aadharPhoto: '',
    candidatePhoto: '',
    candidateSignature: '',
    candidateLeftThumbImpression: '',
    tenthMarksheet: '',
    twelfthMarksheet: '',
    incomeCertificate: '',

    // Optional Identifiers
    apaarId: '',

    // Optional Flags
    exServicemen: false,
    speciallyAbled: false,

    // Education & Course Info
    highestEducationalQualification: '',
    boardOrUniversity: '',
    yearOfPassing: '',
    subjectsStudied: '',
    courseApplied: '',
    preferredModeOfLearning: '',

    // Extra Features
    tShirt: false,
    itTools: false,
    webDesigning: false,
    tally: false,
    gfxDtp: false,
    python: false,
    iot: false,

    // Referral Info
    referralSource: '',
    referralSourceOther: '',
    referalName: '',

    // Computer Access
    computerAccess: false,
    computerAccessOther: '',

    // System Fields
    regNo: '',
    month: '',
    status: 'Pending',

    // Step Tracking
    currentStep: 'basic',
    isCompleted: false,
  });


  const [formId, setFormId] = useState(null);
  const [validationsEnabled, setValidationsEnabled] = useState(true);

  const fetchFormData = async (id) => {
    try {
      const res = await API.get(`/admissions/${id}`);
      setFormData(res);

      // Restore step state
      const restoredStep = steps[res.currentStep - 1] || 'basic';
      setCurrentStep(restoredStep);

      const completed = steps.slice(0, res.currentStep - 1);
      setCompletedSteps(completed);
    } catch (err) {
      console.error('Failed to fetch saved form data:', err);
    }
  };

  useEffect(() => {
    const savedId = localStorage.getItem('admissionFormId');
    if (savedId) {
      setFormId(savedId);
      fetchFormData(savedId);
    }
  }, []);

  useEffect(() => {
    if (formId) {
      localStorage.setItem('admissionFormId', formId);
    }
  }, [formId]);

  const saveStepData = async (data = {}, step = currentStep, complete = false) => {
    const payload = {
      ...formData,
      ...data,
      currentStep: steps.indexOf(step) + 1,
      isCompleted: complete,
    };

    try {
      let response;
      if (formId) {
        response = await API.put(`/admissions/${formId}`, payload);
      } else {
        response = await API.post('/admissions', payload);
        setFormId(response._id);
      }

      setFormData(response);
      return true;
    } catch (err) {
      console.error('Failed to save step data:', err);
      alert('Error saving data');
      return false;
    }
  };

  const handleNext = async (data) => {
    const success = await saveStepData(data, currentStep);
    if (!success) return;

    const mergedData = { ...formData, ...data };
    setFormData(mergedData);

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    const nextStep = steps[steps.indexOf(currentStep) + 1];
    if (nextStep) setCurrentStep(nextStep);
  };

  const handleBack = () => {
    const idx = steps.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(steps[idx - 1]);
    }
  };

  const handleSubmit = async () => {
    const success = await saveStepData({}, 'review', true);
    if (success) {
      notify('Form submitted successfully!', 'success');
      localStorage.removeItem('admissionFormId');
      handleExit();
    }
  };

  const handleExit = () => {
    setCurrentStep('basic');
    setFormData({});
    setFormId(null);
    setCompletedSteps([]);
    localStorage.removeItem('admissionFormId');
  };

  return (
    <div className="w-full p-2 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm font-medium">Enable Validations (dev only):</label>
        <input
          type="checkbox"
          checked={validationsEnabled}
          onChange={(e) => setValidationsEnabled(e.target.checked)}
        />
      </div>

      <Stepper currentStep={currentStep} completedSteps={completedSteps} />

      {formId && (
        <div className="flex justify-between items-center bg-blue-50 dark:bg-gray-800 text-sm px-4 py-2 rounded-lg mb-4 border dark:border-gray-700">
          <div className="font-medium text-blue-900 dark:text-white">
            👤 {formData.fullName || 'Unknown'} &nbsp; | &nbsp; 🆔 {formData.generatedRegNo || 'N/A'}
          </div>
          <button
            className="text-red-600 hover:text-red-800 font-semibold text-xs"
            onClick={handleExit}
          >
            Exit Form
          </button>
        </div>
      )}

      <div className="mt-1">
        {currentStep === 'basic' && (
          <BasicInfo
            onNext={handleNext}
            validationsEnabled={validationsEnabled}
            formData={formData}
          />
        )}
        {currentStep === 'contact' && (
          <Contact
            onNext={handleNext}
            onBack={handleBack}
            validationsEnabled={validationsEnabled}
            formData={formData}
            admissionFormid={formId}
          />
        )}
        {currentStep === 'education' && (
          <Education
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
            validationsEnabled={validationsEnabled}
          />
        )}
        {currentStep === 'extras' && (
          <Extras
            formId={formId}
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
            validationsEnabled={validationsEnabled}
          />
        )}
        {currentStep === 'documents' && (
          <Documents
            formData={formData}
            setFormData={setFormData}
            formId={formId}
            onNext={handleNext}
            onBack={handleBack}
            validationsEnabled={validationsEnabled}
          />
        )}
        {currentStep === 'review' && (
          <Review
            formId={formId}
            formData={formData}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default Admission;
