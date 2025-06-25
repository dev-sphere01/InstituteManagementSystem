import React from 'react'

const Registration = ({sectionTitleClass,labelClass,formData,handleInputChange,inputClass}) => {
    return (
        <div>
            <h3 className={sectionTitleClass}>Registration Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
                <div>
                    <label className={labelClass}>Center Code</label>
                    <input type="text" name="centerCode" value={formData.centerCode} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Employee ID</label>
                    <input type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Other Info</label>
                    <input type="text" name="otherInfo" value={formData.otherInfo} onChange={handleInputChange} className={inputClass} />
                </div>
            </div>
        </div>
    )
}

export default Registration