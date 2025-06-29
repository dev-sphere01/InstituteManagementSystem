import React from 'react'
import Referral from './components/Referral'
import ComputerAccess from './components/ComputerAccess'
import Features from './components/Features'

const Extras = ({ formData, setFormData, onNext, onBack }) => {
  return (
    <div>
      <Features formData={formData} setFormData={setFormData} />
      <ComputerAccess formData={formData} setFormData={setFormData} />
      <Referral formData={formData} setFormData={setFormData} />
      <div className="flex justify-between mt-4">
        <button type="button" className="btn btn-secondary" onClick={onBack}>Back</button>
        <button type="button" className="btn btn-primary" onClick={() => onNext(formData)}>Next</button>
      </div>
    </div>
  )
}

export default Extras