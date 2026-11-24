/**
 * educationOptions.js
 * Centralized master options for the Education step of admission.
 */

export const QUALIFICATIONS = [
  "High School (10th)",
  "Intermediate (12th)",
  "Diploma",
  "Bachelor of Computer Applications (BCA)",
  "Bachelor of Technology (B.Tech)",
  "Bachelor of Science (B.Sc)",
  "Bachelor of Commerce (B.Com)",
  "Bachelor of Arts (B.A)",
  "Master of Computer Applications (MCA)",
  "Master of Technology (M.Tech)",
  "Master of Science (M.Sc)",
  "Master of Business Administration (MBA)",
  "Post Graduate Diploma",
  "Other"
];

export const BOARDS_AND_UNIVERSITIES = [
  "CBSE (Central Board of Secondary Education)",
  "CISCE / ICSE (Council for the Indian School Certificate Examinations)",
  "UP Board (Uttar Pradesh Madhyamik Shiksha Parishad)",
  "Bihar School Examination Board (BSEB)",
  "NIOS (National Institute of Open Schooling)",
  "University of Lucknow",
  "Dr. A.P.J. Abdul Kalam Technical University (AKTU)",
  "Delhi University (DU)",
  "Indira Gandhi National Open University (IGNOU)",
  "Banaras Hindu University (BHU)",
  "Chhatrapati Shahu Ji Maharaj University (CSJMU)",
  "University of Allahabad",
  "Other"
];

export const SUBJECT_OPTIONS = [
  "Physics, Chemistry, Mathematics (PCM)",
  "Physics, Chemistry, Biology (PCB)",
  "Commerce with Mathematics",
  "Commerce with Information Practices",
  "Humanities / Arts",
  "Computer Science / Information Technology",
  "Mechanical Engineering",
  "Electrical & Electronics Engineering",
  "Civil Engineering",
  "General / All Compulsory Subjects",
  "Other"
];

export const getPassingYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 1980; y--) {
    years.push(y.toString());
  }
  years.push("Other");
  return years;
};
