import React from 'react';
import { getAdmissionStyleClasses } from '../styleClasses';
import { useThemeStore } from '../../../store';

const FileInput = ({ label, name, fileName, onChange, inputClass, labelClass }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <div className="mt-1 flex items-center">
      <label htmlFor={name} className={`${inputClass} cursor-pointer w-full flex justify-between items-center`}>
        <span className="truncate">{fileName || "Click to select a file"}</span>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
      </label>
      <input id={name} name={name} type="file" className="sr-only" onChange={onChange} />
    </div>
  </div>
);

const Documents = ({ formData, setFormData, nextStep, prevStep }) => {
  const { isDarkMode } = useThemeStore();
  const { cardClass, sectionTitleClass, labelClass, inputClass, buttonClass, prevButtonClass, clearButtonClass } = getAdmissionStyleClasses();
  
  const radioCheckClass = `form-radio h-4 w-4 ${isDarkMode ? 'text-purple-500 bg-gray-700 border-gray-600' : 'text-purple-600 border-gray-300'} focus:ring-purple-500`;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [e.target.name]: file });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  return (
    <div className={cardClass}>
      <h2 className={sectionTitleClass}>Documents & Photos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileInput label="Aadhar Card*" name="aadharPhoto" fileName={formData.aadharPhoto?.name} onChange={handleFileChange} inputClass={inputClass} labelClass={labelClass} />
        <FileInput label="Candidate Photo*" name="candidatePhoto" fileName={formData.candidatePhoto?.name} onChange={handleFileChange} inputClass={inputClass} labelClass={labelClass} />
        <FileInput label="Candidate Signature*" name="candidateSignature" fileName={formData.candidateSignature?.name} onChange={handleFileChange} inputClass={inputClass} labelClass={labelClass} />
        <FileInput label="Candidate Left Thumb Impression" name="candidateLeftThumbImpression" fileName={formData.candidateLeftThumbImpression?.name} onChange={handleFileChange} inputClass={inputClass} labelClass={labelClass} />
        <div>
          <label className={labelClass}>APAAR ID</label>
          <input type="text" name="apaarId" value={formData.apaarId || ''} onChange={handleChange} className={inputClass} />
        </div>
        <FileInput label="10th Marksheet*" name="tenthMarksheet" fileName={formData.tenthMarksheet?.name} onChange={handleFileChange} inputClass={inputClass} labelClass={labelClass} />
        <FileInput label="12th Marksheet" name="twelfthMarksheet" fileName={formData.twelfthMarksheet?.name} onChange={handleFileChange} inputClass={inputClass} labelClass={labelClass} />
        
        <div>
          <label className={labelClass}>Ex-Servicemen*</label>
          <div className="mt-2 flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input type="radio" name="exServicemen" value="Yes" checked={formData.exServicemen === 'Yes'} onChange={handleChange} className={radioCheckClass} />
              <span className="ml-2 text-sm">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input type="radio" name="exServicemen" value="No" checked={formData.exServicemen === 'No'} onChange={handleChange} className={radioCheckClass} />
              <span className="ml-2 text-sm">No</span>
            </label>
          </div>
        </div>

        <div>
          <label className={labelClass}>Specially Abled*</label>
          <div className="mt-2 flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input type="radio" name="speciallyAbled" value="Yes" checked={formData.speciallyAbled === 'Yes'} onChange={handleChange} className={radioCheckClass} />
              <span className="ml-2 text-sm">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input type="radio" name="speciallyAbled" value="No" checked={formData.speciallyAbled === 'No'} onChange={handleChange} className={radioCheckClass} />
              <span className="ml-2 text-sm">No</span>
            </label>
            <label className="inline-flex items-center">
              <input type="radio" name="speciallyAbled" value="Other" checked={formData.speciallyAbled === 'Other'} onChange={handleChange} className={radioCheckClass} />
              <span className="ml-2 text-sm">Other</span>
            </label>
          </div>
        </div>

        {formData.speciallyAbled === 'Other' && (
          <div>
            <label className={labelClass}>If Other, please specify</label>
            <input type="text" name="speciallyAbledOther" value={formData.speciallyAbledOther || ''} onChange={handleChange} className={inputClass} />
          </div>
        )}
      </div>
      <div className="mt-8 flex justify-between">
        <button onClick={prevStep} className={prevButtonClass}>Previous</button>
        <div className='flex justify-end gap-4'>
          <button className={clearButtonClass}>Clear Form</button>
          <button onClick={nextStep} className={buttonClass}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default Documents;