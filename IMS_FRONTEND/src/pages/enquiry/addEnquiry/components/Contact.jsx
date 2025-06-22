import React from 'react'

const Contact = ({ sectionTitleClass, labelClass, formData, inputClass, handleInputChange, validationErrors, errorClass }) => {
    return (
        <div>
            <h3 className={sectionTitleClass}>Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                    <label className={labelClass}>Contact Number <span className="text-red-500">*</span></label>
                    <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className={inputClass} maxLength={10} placeholder="10 digit mobile (WhatsApp)" />
                    {validationErrors.contactNumber && <p className={errorClass}>{validationErrors.contactNumber}</p>}
                </div>
                <div>
                    <label className={labelClass}>Alternate Contact Number</label>
                    <input type="text" name="altContactNumber" value={formData.altContactNumber} onChange={handleInputChange} className={inputClass} maxLength={10} placeholder="Alternate number" />
                </div>
                <div>
                    {/* <span className="text-red-500">*</span> */}
                    <label className={labelClass}>Email Address </label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} placeholder="example@email.com" />
                    {/* {validationErrors.email && <p className={errorClass}>{validationErrors.email}</p>} */}
                </div>
                <div>
                    <label className={labelClass}>Residential Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Pin Code</label>
                    <input type="text" name="pinCode" value={formData.pinCode} onChange={handleInputChange} className={inputClass} maxLength={6} />
                </div>
            </div>
        </div>
    )
}

export default Contact