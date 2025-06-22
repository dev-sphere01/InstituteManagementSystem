import React from 'react'

const Personal = ({ sectionTitleClass, labelClass, formData, errorClass, inputClass, handleInputChange, validationErrors, radioCheckClass, isDarkMode }) => {
    return (
        <div>
            <h3 className={sectionTitleClass}>Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                    <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={inputClass} required />
                    {validationErrors.fullName && <p className={errorClass}>{validationErrors.fullName}</p>}
                </div>
                <div>
                    <label className={labelClass}>Date of Birth</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className={inputClass}>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className={inputClass}>
                        <option value="">Select Category</option>
                        <option value="general">General</option>
                        <option value="st">ST</option>
                        <option value="sc">SC</option>
                        <option value="obc">OBC</option>
                    </select>
                </div>
                <div className="flex items-center space-x-6 col-span-1 sm:col-span-2 mt-2">
                    <label className="inline-flex items-center">
                        <input type="radio" name="isExServiceMan" checked={formData.isExServiceMan} onChange={handleInputChange} className={radioCheckClass} />
                        <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ex-ServiceMan</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input type="radio" name="isSpeciallyAbled" checked={formData.isSpeciallyAbled} onChange={handleInputChange} className={radioCheckClass} />
                        <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Specially Abled</span>
                    </label>
                </div>
            </div>
        </div>
    )
}

export default Personal