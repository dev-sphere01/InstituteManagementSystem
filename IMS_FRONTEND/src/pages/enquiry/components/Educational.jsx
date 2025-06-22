import React from 'react'

const Educational = ({
    sectionTitleClass,
    labelClass,
    formData,
    inputClass,
    handleInputChange,
    toggleBtnClass,
    eduType,
    toggleBtnClassRight,
    setEduType,
    SearchableDropdown,
    boardOptions,
    handleBoardChange,
    universityOptions,
    handleUniversityChange,
    subjectsList,
    handleSubjectsChange,
    

 }) => {
    return (
        <div>
            <h3 className={sectionTitleClass}>Educational Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                    <label className={labelClass}>Current Educational Qualification</label>
                    <input type="text" name="qualification" value={formData.qualification} onChange={handleInputChange} className={inputClass} />
                </div>
                <div className="flex items-end gap-2">
                    <div className="flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 h-11">
                        <button type="button" className={toggleBtnClass(eduType === 'board')} onClick={() => setEduType('board')}>Board</button>
                        <button type="button" className={toggleBtnClassRight(eduType === 'university')} onClick={() => setEduType('university')}>University</button>
                    </div>
                    <div className="flex-1 min-w-0">
                        {eduType === 'board' ? (
                            <SearchableDropdown
                                options={boardOptions}
                                value={formData.board}
                                onChange={handleBoardChange}
                                placeholder="Select Board"
                            />
                        ) : (
                            <SearchableDropdown
                                options={universityOptions}
                                value={formData.university}
                                onChange={handleUniversityChange}
                                placeholder="Select University"
                            />
                        )}
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Year of Passing</label>
                    <input type="number" name="passingYear" value={formData.passingYear} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Subjects Studied</label>
                    <SearchableDropdown
                        options={subjectsList}
                        value={formData.subjects}
                        onChange={handleSubjectsChange}
                        placeholder="Select Subjects"
                        isMulti
                    />
                </div>
            </div>
        </div>
    )
}

export default Educational