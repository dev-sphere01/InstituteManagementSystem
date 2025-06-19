import React from 'react'

export const SchedulePref = ({
    sectionTitleClass,
    labelClass,
    formData,
    handleInputChange,
    inputClass,
}) => {
    return (
        <div>
            <h3 className={sectionTitleClass}>Schedule Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                    <label className={labelClass}>Preferred Batch Time</label>
                    <select name="preferredBatchTime" value={formData.preferredBatchTime} onChange={handleInputChange} className={inputClass}>
                        <option value="">Select Batch Time</option>
                        <option value="morning">Morning (9 AM - 12 PM)</option>
                        <option value="afternoon">Afternoon (1 PM - 4 PM)</option>
                        <option value="evening">Evening (5 PM - 8 PM)</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Important Note Related to Time</label>
                    <textarea name="timeNote" value={formData.timeNote} onChange={handleInputChange} rows={3} className={inputClass}></textarea>
                </div>
            </div>
        </div>
    )
}
