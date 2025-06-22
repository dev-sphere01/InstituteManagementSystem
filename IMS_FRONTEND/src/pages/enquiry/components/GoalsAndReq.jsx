import React from 'react'

const GoalsAndReq = ({
    sectionTitleClass,
    labelClass,
    formData,
    handleInputChange,
    inputClass,
    radioCheckClass,
    isDarkMode,
}) => {
    return (
        <div>
            <h3 className={sectionTitleClass}>Goals & Requirements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                    <label className={labelClass}>What are your goals for taking this course?</label>
                    <select name="courseGoals" value={formData.courseGoals} onChange={handleInputChange} className={inputClass}>
                        <option value="">Select Goal</option>
                        <option value="career">Career Advancement</option>
                        <option value="skill">Skill Development</option>
                        <option value="personal">Personal Interest</option>
                        <option value="academic">Academic Requirements</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Future Goals</label>
                    <div className="flex items-center space-x-6 mt-2">
                        <label className="inline-flex items-center">
                            <input type="checkbox" name="futureGoals" value="job" checked={formData.futureGoals.includes('job')} onChange={handleInputChange} className={radioCheckClass} />
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Get a Job</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input type="checkbox" name="futureGoals" value="business" checked={formData.futureGoals.includes('business')} onChange={handleInputChange} className={radioCheckClass} />
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start a Business</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input type="checkbox" name="futureGoals" value="higher_education" checked={formData.futureGoals.includes('higher_education')} onChange={handleInputChange} className={radioCheckClass} />
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Higher Education</span>
                        </label>
                    </div>
                </div>
                <div className="sm:col-span-2">
                    <label className={labelClass}>Do you have access to a computer and the necessary software?</label>
                    <div className="flex items-center space-x-6 mt-2">
                        <label className="inline-flex items-center">
                            <input type="radio" name="hasComputerAccess" value="yes" checked={formData.hasComputerAccess === 'yes'} onChange={handleInputChange} className={radioCheckClass} />
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Yes</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input type="radio" name="hasComputerAccess" value="no" checked={formData.hasComputerAccess === 'no'} onChange={handleInputChange} className={radioCheckClass} />
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GoalsAndReq