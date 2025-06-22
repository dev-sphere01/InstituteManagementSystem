import React from 'react'

const Referral = ({
    sectionTitleClass,
    labelClass,
    formData,
    inputClass,
    handleInputChange,
    radioCheckClass,
    isDarkMode
}) => {
    return (
        <div>
            <h3 className={sectionTitleClass}>Referral Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-6">
                <div>
                    <label className={labelClass}>Referral Source</label>
                    <div className="flex items-center space-x-6 mt-2">
                        <label className="inline-flex items-center">
                            <input type="radio" name="referralSource" value="friend" checked={formData.referralSource === 'friend'} onChange={handleInputChange} className={radioCheckClass} />
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Friend</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input type="radio" name="referralSource" value="institution" checked={formData.referralSource === 'institution'} onChange={handleInputChange} className={radioCheckClass} />
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Institution</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input type="radio" name="referralSource" value="other" checked={formData.referralSource === 'other'} onChange={handleInputChange} className={radioCheckClass} />
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Other</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Source Name</label>
                    <input type="text" name="sourceName" value={formData.sourceName} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Referral Code</label>
                    <input type="text" name="referralCode" value={formData.referralCode} onChange={handleInputChange} className={inputClass} />
                </div>
            </div>
        </div>
    )
}

export default Referral