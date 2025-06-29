import React from 'react';

const Review = ({ formData = {}, onBack, onSubmit }) => {
  // Group fields for display
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
      ],
    },
    {
      title: 'Extras',
      fields: [
        { label: 'Features', value: Object.entries(formData).filter(([k,v]) => ['tShirt','itTools','webDesigning','tally','gfxDtp','python','iot'].includes(k) && v).map(([k]) => k).join(', ') },
        { label: 'Computer Access', value: formData.computerAccess },
        { label: 'Referral Source', value: formData.referralSource },
        { label: 'Referred By', value: formData.referralSourceOther || formData.referralSource },
      ],
    },
  ];

  return (
    <div className="p-6 rounded-xl shadow-md bg-background text-foreground w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-primary">Review Your Details</h2>
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-lg font-semibold mb-2 text-muted-foreground">{section.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 bg-muted/30 rounded-lg p-4">
              {section.fields.map((field) => (
                <div key={field.label} className="flex flex-col">
                  <span className="text-xs text-muted-foreground">{field.label}</span>
                  <span className="font-medium text-base text-foreground break-all">{field.value || <span className='italic text-muted-foreground'>-</span>}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-8">
        <button type="button" className="btn btn-secondary" onClick={onBack}>Back</button>
        <button type="button" className="btn btn-primary" onClick={onSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default Review;