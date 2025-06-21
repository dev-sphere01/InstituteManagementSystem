import React from 'react';
import { getAdmissionStyleClasses } from '../styleClasses';
import { useThemeStore } from '../../../store';

const ReviewSection = ({ title, children, sectionTitleClass }) => (
    <div className="p-4 border rounded-md">
        <h3 className={sectionTitleClass}>{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {children}
        </div>
    </div>
)

const ReviewField = ({ label, value }) => {
    const { isDarkMode } = useThemeStore();
    return (
        <div>
            <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</h4>
            <p className={`text-md ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{value || 'Not provided'}</p>
        </div>
    )
};

const Review = ({ formData, prevStep, submitForm }) => {
    const { cardClass, sectionTitleClass, prevButtonClass, submitButtonClass } = getAdmissionStyleClasses();
    const { isDarkMode } = useThemeStore();

    const getSelectedCourses = () => {
        const courses = ['tShirt', 'itTools', 'webDesigning', 'tally', 'gfxDtp', 'python', 'iot'];
        return courses.filter(course => formData[course]).map(course => course.charAt(0).toUpperCase() + course.slice(1).replace(/([A-Z])/g, ' $1')).join(', ');
    }

    return (
        <div className={cardClass}>
            <h2 className={sectionTitleClass}>Review Your Information</h2>
            <p className={isDarkMode ? 'text-gray-400 mb-6' : 'text-gray-600 mb-6'}>Please review all the information you have entered. Once you submit, you won't be able to edit it.</p>

            <div className="space-y-6">
                <ReviewSection title="Basic Information" sectionTitleClass={sectionTitleClass}>
                    <ReviewField label="Form No" value={formData.formNo} />
                    <ReviewField label="Center Code" value={formData.centerCode} />
                    <ReviewField label="Employee ID" value={formData.employeeId} />
                    <ReviewField label="Registration No" value={formData.generatedRegNo} />
                    <ReviewField label="Full Name" value={formData.fullName} />
                    <ReviewField label="Date of Birth" value={formData.dob} />
                    <ReviewField label="Gender" value={formData.gender} />
                    <ReviewField label="Category" value={formData.category} />
                    <ReviewField label="Aadhar No" value={formData.aadharNo} />
                    <ReviewField label="Religion" value={formData.religion} />
                    <ReviewField label="Other Info" value={formData.otherInfo} />
                </ReviewSection>

                <ReviewSection title="Documents & Photos" sectionTitleClass={sectionTitleClass}>
                    <ReviewField label="Aadhar Card" value={formData.aadharPhoto?.name} />
                    <ReviewField label="Candidate Photo" value={formData.candidatePhoto?.name} />
                    <ReviewField label="Candidate Signature" value={formData.candidateSignature?.name} />
                    <ReviewField label="Candidate Left Thumb Impression" value={formData.candidateLeftThumbImpression?.name} />
                    <ReviewField label="APAAR ID" value={formData.apaarId} />
                    <ReviewField label="10th Marksheet" value={formData.tenthMarksheet?.name} />
                    <ReviewField label="12th Marksheet" value={formData.twelfthMarksheet?.name} />
                    <ReviewField label="Ex-Servicemen" value={formData.exServicemen} />
                    <ReviewField label="Specially Abled" value={formData.speciallyAbled} />
                    {formData.speciallyAbled === 'Other' && <ReviewField label="Specially Abled Details" value={formData.speciallyAbledOther} />}
                </ReviewSection>

                <ReviewSection title="Contact Information" sectionTitleClass={sectionTitleClass}>
                    <ReviewField label="Contact Number" value={formData.contactNumber} />
                    <ReviewField label="Alternate Contact Number" value={formData.alternateContactNumber} />
                    <ReviewField label="Email Address" value={formData.emailAddress} />
                    <ReviewField label="State" value={formData.state} />
                    <ReviewField label="District" value={formData.district} />
                    <ReviewField label="Residential Address" value={formData.address} />
                    <ReviewField label="Pin Code" value={formData.pinCode} />
                    <ReviewField label="Father's Name" value={formData.fathersName} />
                    <ReviewField label="Father's Occupation" value={formData.fathersOccupation} />
                    <ReviewField label="Mother's Name" value={formData.mothersName} />
                    {formData.hasGuardian && (
                        <>
                            <ReviewField label="Guardian's Name" value={formData.guardianName} />
                            <ReviewField label="Guardian's Relation" value={formData.guardianRelation} />
                            <ReviewField label="Guardian's Contact Number" value={formData.guardianContactNumber} />
                        </>
                    )}
                </ReviewSection>

                <ReviewSection title="Educational & Course Information" sectionTitleClass={sectionTitleClass}>
                    <ReviewField label="Highest Educational Qualification" value={formData.highestEducationalQualification} />
                    <ReviewField label="Board/University" value={formData.boardOrUniversity} />
                    <ReviewField label="Year of Passing" value={formData.yearOfPassing} />
                    <ReviewField label="Subjects Studied" value={formData.subjectsStudied} />
                    <ReviewField label="Course Applied For" value={formData.courseApplied} />
                    <ReviewField label="Preferred Mode of Learning" value={formData.preferredModeOfLearning} />
                    <ReviewField label="Additional Courses" value={getSelectedCourses()} />
                    <ReviewField label="Referral Source" value={formData.referralSource} />
                    <ReviewField label="Referral Name" value={formData.referralName} />
                    <ReviewField label="Computer Access" value={formData.computerAccess} />
                </ReviewSection>
            </div>

            <div className="mt-8 flex justify-between">
                <button onClick={prevStep} className={prevButtonClass}>Previous</button>
                <button onClick={submitForm} className={submitButtonClass}>Submit</button>
            </div>
        </div>
    );
};

export default Review; 