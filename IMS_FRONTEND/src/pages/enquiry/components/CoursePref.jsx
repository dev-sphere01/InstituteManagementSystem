import React from 'react'

const CoursePref = ({
    sectionTitleClass,
    labelClass,
    formData,
    handleInputChange,
    inputClass,
    coursesList,
    radioCheckClass,
    isDarkMode,
    
}) => {
    return (
        <div>
            <h3 className={sectionTitleClass}>Course Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                    <label className={labelClass}>Interested Course</label>
                    <select name="interestedCourse" value={formData.interestedCourse} onChange={handleInputChange} className={inputClass}>
                        <option value="">Select Course</option>
                        {coursesList.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Preferred Mode of Learning</label>
                    <div className="flex items-center space-x-6 mt-2">
                        <label className="inline-flex items-center">
                            <input type="radio" name="learningMode" value="online" checked={formData.learningMode === 'online'} onChange={handleInputChange} className={radioCheckClass} />
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Online</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input type="radio" name="learningMode" value="offline" checked={formData.learningMode === 'offline'} onChange={handleInputChange} className={radioCheckClass} />
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Offline</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Course Level</label>
                    <select name="courseLevel" value={formData.courseLevel} onChange={handleInputChange} className={inputClass}>
                        <option value="">Select Level</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

export default CoursePref