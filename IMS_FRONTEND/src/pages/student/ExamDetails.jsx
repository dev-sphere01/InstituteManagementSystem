import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DUMMY_STUDENTS = [
  {
    _id: '1',
    studentId: 'STU001',
    name: 'Alice Johnson',
    photo: '',
    course: 'B.Sc Computer Science',
    totalFee: 50000,
    depositedFee: 30000,
    isCombo: false,
    comboCourses: [],
    courseType: 'O',
  },
  {
    _id: '2',
    studentId: 'STU002',
    name: 'Bob Smith',
    photo: '',
    course: 'DOAP + DCA',
    totalFee: 42000,
    depositedFee: 42000,
    isCombo: true,
    comboCourses: ['DOAP', 'DCA'],
    courseType: 'RGCSM',
  },
  {
    _id: '3',
    studentId: 'STU003',
    name: 'Charlie Lee',
    photo: '',
    course: 'State Govt Course',
    totalFee: 47000,
    depositedFee: 20000,
    isCombo: false,
    comboCourses: [],
    courseType: 'StateGovt',
  }
];

const ExamDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const student = DUMMY_STUDENTS.find(s => s.studentId === studentId);

  const [selectedCourse, setSelectedCourse] = React.useState(student?.isCombo ? '' : student?.course);
  const [reminderCalls, setReminderCalls] = React.useState([]);
  const [examFormConfirm, setExamFormConfirm] = React.useState('');
  const [selectedSubjects, setSelectedSubjects] = React.useState([]);
  const [semester, setSemester] = React.useState('');
  const [admitType, setAdmitType] = React.useState('');
  const [admitReminderCalls, setAdmitReminderCalls] = React.useState([]);
  const [showPracticalForm, setShowPracticalForm] = React.useState(false);

  const addReminderCall = (type) => {
    const remark = prompt('Enter call remarks:');
    if (!remark) return;
    const call = { count: (type === 'exam' ? reminderCalls : admitReminderCalls).length + 1, remarks: remark };
    type === 'exam' ? setReminderCalls([...reminderCalls, call]) : setAdmitReminderCalls([...admitReminderCalls, call]);
  };

  const handleCourseClick = (course) => setSelectedCourse(course);
  const subjectOptions = ['IT', 'Web', 'Python', 'IOT'];
  const handleSubjectToggle = (subj) => {
    setSelectedSubjects(selectedSubjects.includes(subj)
      ? selectedSubjects.filter(s => s !== subj)
      : [...selectedSubjects, subj]);
  };

  const renderCourseForm = () => {
    if (!selectedCourse) return <div className="text-gray-500 dark:text-gray-400">Select a course to continue.</div>;

    let type = student.courseType;
    if (student.isCombo) {
      if (selectedCourse === 'O') type = 'O';
      else if (['DOAP','DCA','PGDCA','Tally'].includes(selectedCourse)) type = 'RGCSM';
      else type = 'StateGovt';
    }

    const renderCommonFields = () => (
      <>
        <div className="mb-2">Confirmation:
          <label className="ml-2"><input type="radio" name="examform" checked={examFormConfirm==='yes'} onChange={()=>setExamFormConfirm('yes')} /> Yes</label>
          <label className="ml-2"><input type="radio" name="examform" checked={examFormConfirm==='no'} onChange={()=>setExamFormConfirm('no')} /> No</label>
        </div>

        {examFormConfirm==='yes' && type === 'O' && (
          <div className="mb-2">Select Subjects:
            {subjectOptions.map(subj => (
              <label key={subj} className="ml-2">
                <input type="checkbox" checked={selectedSubjects.includes(subj)} onChange={() => handleSubjectToggle(subj)} /> {subj}
              </label>
            ))}
          </div>
        )}

        {examFormConfirm==='yes' && type === 'RGCSM' && (
          <div className="mb-2">
            Semester:
            <input
              type="text"
              value={semester}
              onChange={e=>setSemester(e.target.value)}
              placeholder="Enter semester"
              className="ml-2 border px-2 py-1 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
            />
          </div>
        )}

        <div className="mb-2">Admit card reminder call (theory/practical):
          <select
            value={admitType}
            onChange={e=>{setAdmitType(e.target.value); setShowPracticalForm(e.target.value==='practical')}}
            className="ml-2 border rounded px-2 py-1 bg-white dark:bg-gray-800 text-black dark:text-white"
          >
            <option value="">Select</option>
            <option value="theory">Theory</option>
            <option value="practical">Practical</option>
          </select>
          <button onClick={() => addReminderCall('admit')} className="ml-2 px-2 py-1 bg-green-500 text-white rounded">Add Call</button>
        </div>
        <ul className="mb-2 list-disc ml-6 text-sm">
          {admitReminderCalls.map((c, i) => <li key={i}>Call {c.count}: {c.remarks}</li>)}
        </ul>

        {showPracticalForm && (
          <div className="mt-2 border-t pt-2">
            <b>Practical Admit Card Reminder Calls</b>
            <div className="mb-2 flex items-center gap-2">
              <span>Reminder calls:</span>
              <button onClick={() => addReminderCall('admit')} className="px-2 py-1 bg-blue-500 text-white rounded">Add Call</button>
            </div>
            <ul className="mb-2 list-disc ml-6 text-sm">
              {admitReminderCalls.map((c, i) => <li key={i}>Call {c.count}: {c.remarks}</li>)}
            </ul>
          </div>
        )}
      </>
    );

    return (
      <div className="mb-4">
        <h3 className="font-semibold mb-2">{type} Exam Form</h3>
        <div className="mb-2 flex items-center gap-2">
          <span>Exam form reminder calls:</span>
          <button onClick={() => addReminderCall('exam')} className="px-2 py-1 bg-blue-500 text-white rounded">Add Call</button>
        </div>
        <ul className="mb-2 list-disc ml-6 text-sm">
          {reminderCalls.map((c, i) => <li key={i}>Call {c.count}: {c.remarks}</li>)}
        </ul>
        {renderCommonFields()}
      </div>
    );
  };

  if (!student) return <div className="p-6 text-gray-700 dark:text-gray-200">Student not found.</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto text-gray-800 dark:text-gray-100">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 dark:text-blue-400 hover:underline">&larr; Back</button>
      <h2 className="text-xl font-bold mb-4">Exam Details for {student.name}</h2>

      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded shadow p-4 mb-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-3xl">
            {student.photo ? <img src={student.photo} alt="" className="w-full h-full rounded-full" /> : student.name[0]}
          </div>
          <div>
            <div><b>Registration No:</b> {student.studentId}</div>
            <div><b>Name:</b> {student.name}</div>
            <div><b>Course:</b> {student.course}</div>
            <div><b>Total Fee:</b> ₹{student.totalFee.toLocaleString()}</div>
            <div><b>Deposited Fee:</b> ₹{student.depositedFee.toLocaleString()}</div>
          </div>
        </div>
        {student.isCombo && (
          <div className="mb-2">
            <b>Combo Courses:</b>
            {student.comboCourses.map(c => (
              <button
                key={c}
                onClick={() => handleCourseClick(c)}
                className={`ml-2 px-2 py-1 rounded ${selectedCourse === c ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white'}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {renderCourseForm()}
    </div>
  );
};

export default ExamDetails;