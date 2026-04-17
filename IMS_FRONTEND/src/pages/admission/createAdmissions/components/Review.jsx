import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useThemeStore } from '../../../../store'; // update if needed

const Review = ({formId, formData = {}, onBack, onSubmit }) => {
  const { isDarkMode } = useThemeStore();

  const featureKeys = ['tShirt', 'itTools', 'webDesigning', 'tally', 'gfxDtp', 'python', 'iot'];
  const selectedFeatures = featureKeys
    .filter((key) => formData[key])
    .map((key) => key.charAt(0).toUpperCase() + key.slice(1))
    .join(', ');

  const sections = [
    {
      title: 'Basic Info',
      fields: [
        { label: 'Full Name', value: formData.fullName },
        { label: 'Date of Birth', value: formData.dob },
        { label: 'Gender', value: formData.gender },
        { label: 'Category', value: formData.category },
        { label: 'Aadhar No', value: formData.aadharNo },
        { label: 'Religion', value: formData.religion },
      ],
    },
    {
      title: 'Contact Details',
      fields: [
        { label: 'Contact Number', value: formData.contactNumber },
        { label: 'Email', value: formData.emailAddress },
        { label: 'State', value: formData.state },
        { label: 'District', value: formData.district },
        { label: 'Address', value: formData.address },
        { label: 'Pin Code', value: formData.pinCode },
      ],
    },
    {
      title: 'Education',
      fields: [
        { label: 'Qualification', value: formData.highestEducationalQualification },
        { label: 'Board/University', value: formData.boardOrUniversity },
        { label: 'Year of Passing', value: formData.yearOfPassing },
        { label: 'Subjects Studied', value: formData.subjectsStudied },
        { label: 'Course Applied', value: formData.courseApplied },
        { label: 'Mode of Learning', value: formData.preferredModeOfLearning },
      ],
    },
    {
      title: 'Extras',
      fields: [
        { label: 'Selected Features', value: selectedFeatures || '-' },
        { label: 'Computer Access', value: formData.computerAccessOther || '-' },
        { label: 'Referral Source', value: formData.referralSource || '-' },
        { label: 'Referral - Other', value: formData.referralSourceOther || '-' },
        { label: 'Referred By (Name)', value: formData.referalName || '-' },
      ],
    }
    
  ];

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Admission Form Review', 14, 22);
    doc.setFontSize(12);

    sections.forEach((section) => {
      autoTable(doc, {
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 30,
        head: [[section.title, '']],
        body: section.fields.map((field) => [field.label, field.value || '-']),
        theme: 'striped',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
      });
    });

    doc.save('admission-review.pdf');
  };

  const containerClasses = `p-6 rounded-xl shadow-md w-full ${
    isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
  }`;

  const sectionBg = isDarkMode ? 'bg-gray-700' : 'bg-gray-50';
  const textMuted = isDarkMode ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className="w-full mt-1">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>Review Your Details</h2>
        <button
          type="button"
          onClick={downloadPDF}
          className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Download PDF
        </button>
      </div>

      <div className={`${containerClasses} space-y-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className={`text-lg font-semibold mb-2 ${textMuted}`}>{section.title}</h3>
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${sectionBg} p-4 rounded-lg`}
            >
              {section.fields.map((field) => (
                <div key={field.label} className="flex flex-col">
                  <span className={`text-xs ${textMuted}`}>{field.label}</span>
                  <span className="text-sm font-medium break-all">
                    {field.value || <span className="italic text-muted-foreground">-</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-between pt-6 border-t mt-6">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Back
          </button>
          <button type="button" className="btn btn-primary" onClick={onSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Review;
