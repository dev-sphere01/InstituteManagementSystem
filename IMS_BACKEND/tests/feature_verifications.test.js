const test = require('node:test');
const assert = require('node:assert/strict');

// 1. Logic for Under-18 Minor Age & Guardian Validation
function calculateAge(dobString) {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function validateGuardianRequirement(student) {
  const age = calculateAge(student.dateOfBirth);
  if (age === null) {
    return { valid: false, error: 'Valid Date of Birth is required' };
  }
  if (age < 18) {
    // Under 18 requires guardian details and consent
    if (!student.guardianType || !student.guardianName || !student.guardianContactNumber) {
      return { valid: false, error: 'Parent/Guardian details are required for minor students (under 18)' };
    }
    if (!student.guardianConsent) {
      return { valid: false, error: 'Parent/Guardian consent checkbox must be accepted for minors' };
    }
    return { valid: true, isMinor: true };
  }
  return { valid: true, isMinor: false };
}

// 2. Logic for ID Proof Validation ("At least ONE" rule)
const ID_PATTERNS = {
  panCard: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  drivingLicence: /^[A-Z]{2}[0-9]{2}[0-9A-Z]{11}$/,
  passport: /^[A-PR-WYa-pr-wy][1-9]\d\s?\d{4}[1-9]$/,
  epicNo: /^[A-Z]{3}[0-9]{7}$/,
  apaarId: /^[0-9]{12}$/
};

function validateIdProofs(docs) {
  const hasPan = Boolean(docs.panCardNumber && docs.panCardNumber.trim());
  const hasDl = Boolean(docs.drivingLicenceNumber && docs.drivingLicenceNumber.trim());
  const hasPassport = Boolean(docs.passportNumber && docs.passportNumber.trim());
  const hasEpic = Boolean(docs.epicNo && docs.epicNo.trim());

  if (!hasPan && !hasDl && !hasPassport && !hasEpic) {
    return { valid: false, error: 'At least ONE of PAN Card, Driving Licence, Passport, or Voter ID (EPIC) is required.' };
  }

  // Format validations
  if (hasPan && !ID_PATTERNS.panCard.test(docs.panCardNumber.trim().toUpperCase())) {
    return { valid: false, error: 'Invalid PAN Card Number format (e.g. ABCDE1234F).' };
  }
  if (hasDl && !ID_PATTERNS.drivingLicence.test(docs.drivingLicenceNumber.trim().toUpperCase())) {
    return { valid: false, error: 'Invalid Driving Licence format.' };
  }
  if (hasPassport && !ID_PATTERNS.passport.test(docs.passportNumber.trim().toUpperCase())) {
    return { valid: false, error: 'Invalid Passport format.' };
  }
  if (hasEpic && !ID_PATTERNS.epicNo.test(docs.epicNo.trim().toUpperCase())) {
    return { valid: false, error: 'Invalid EPIC/Voter ID format (e.g. ABC1234567).' };
  }

  // APAAR ID is optional, but if entered must be 12 digits
  if (docs.apaarId && docs.apaarId.trim() && !ID_PATTERNS.apaarId.test(docs.apaarId.trim())) {
    return { valid: false, error: 'APAAR ID must be exactly 12 digits if provided.' };
  }

  return { valid: true };
}

// 3. Logic for Case Normalization
function toTitleCase(str) {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
    .join(' ');
}

function normalizeStudentData(data) {
  const normalized = { ...data };
  const lowercaseFields = ['emailAddress', 'email'];
  const titleCaseFields = ['presentAddress', 'permanentAddress', 'address'];
  const excludedFields = [
    'password', 'url', 'avatar', 'photo', 'signature',
    'candidatePhoto', 'candidateSignature', 'candidateLeftThumbImpression',
    'aadharPhoto', 'tenthMarksheet', 'twelfthMarksheet', 'exServicemen',
    'speciallyAbled', 'incomeCertificate', 'panCardDoc', 'drivingLicenceDoc',
    'passportDoc', 'epicDoc', 'guardianDoc', 'otherInfo', 'remarks'
  ];

  for (const [key, val] of Object.entries(normalized)) {
    if (typeof val === 'string' && val.trim().length > 0) {
      if (lowercaseFields.includes(key)) {
        normalized[key] = val.trim().toLowerCase();
      } else if (titleCaseFields.includes(key)) {
        normalized[key] = toTitleCase(val.trim());
      } else if (!excludedFields.includes(key) && !/^\d{4}-\d{2}-\d{2}/.test(val) && !key.toLowerCase().includes('date')) {
        normalized[key] = val.trim().toUpperCase();
      }
    }
  }
  return normalized;
}

// 4. Logic for Fee & EMI Calculations
function calculateFeePlan({ totalFee, discountType, discountValue, numInstallments = 1, startDate = new Date() }) {
  const total = parseFloat(totalFee) || 0;
  let discountAmount = 0;
  let discountPercent = 0;

  if (discountType === 'percent') {
    discountPercent = Math.min(100, Math.max(0, parseFloat(discountValue) || 0));
    discountAmount = Math.round((total * discountPercent) / 100);
  } else {
    discountAmount = Math.min(total, Math.max(0, parseFloat(discountValue) || 0));
    discountPercent = total > 0 ? parseFloat(((discountAmount / total) * 100).toFixed(2)) : 0;
  }

  const netPayable = Math.max(0, total - discountAmount);
  const n = Math.max(1, parseInt(numInstallments, 10) || 1);
  const baseEmi = Math.floor(netPayable / n);
  const remainder = netPayable - (baseEmi * n);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const installments = [];
  const start = new Date(startDate);

  for (let i = 0; i < n; i++) {
    const due = new Date(start);
    due.setMonth(due.getMonth() + i);
    const amount = i === n - 1 ? baseEmi + remainder : baseEmi;
    installments.push({
      installmentNumber: i + 1,
      expectedMonth: `${months[due.getMonth()]} ${due.getFullYear()}`,
      dueDate: due,
      amount
    });
  }

  return {
    totalFee: total,
    discountAmount,
    discountPercent,
    netPayable,
    numInstallments: n,
    installments
  };
}

// 5. Logic for Overdue Detection and Escalation
function checkOverdueStatus(installment, asOfDate = new Date(), escalationDays = 7) {
  if (installment.status === 'Paid') {
    return { status: 'Paid', isOverdue: false, isEscalated: false };
  }

  const dueDate = new Date(installment.dueDate);
  if (asOfDate > dueDate) {
    const diffMs = asOfDate.getTime() - dueDate.getTime();
    const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const isEscalated = daysOverdue >= escalationDays;
    return {
      status: isEscalated ? 'Escalated' : 'Overdue',
      isOverdue: true,
      daysOverdue,
      isEscalated
    };
  }

  return { status: 'Pending', isOverdue: false, isEscalated: false };
}

// ====================== TEST SUITE ======================

test('Section B: Under-18 Minor Age & Guardian Validation', async (t) => {
  await t.test('calculates minor age and flags required guardian details', () => {
    // 16 years old
    const minorDob = new Date();
    minorDob.setFullYear(minorDob.getFullYear() - 16);
    
    const minorStudentNoGuardian = {
      dateOfBirth: minorDob.toISOString(),
      fullName: 'ALICE DOE'
    };
    const res1 = validateGuardianRequirement(minorStudentNoGuardian);
    assert.equal(res1.valid, false);
    assert.match(res1.error, /Parent\/Guardian details are required/);

    const minorStudentWithGuardianNoConsent = {
      ...minorStudentNoGuardian,
      guardianType: 'Father',
      guardianName: 'JOHN DOE',
      guardianContactNumber: '9876543210'
    };
    const res2 = validateGuardianRequirement(minorStudentWithGuardianNoConsent);
    assert.equal(res2.valid, false);
    assert.match(res2.error, /consent checkbox must be accepted/);

    const minorStudentValid = {
      ...minorStudentWithGuardianNoConsent,
      guardianConsent: true
    };
    const res3 = validateGuardianRequirement(minorStudentValid);
    assert.equal(res3.valid, true);
    assert.equal(res3.isMinor, true);
  });

  await t.test('allows 18+ adult students without guardian fields', () => {
    // 21 years old
    const adultDob = new Date();
    adultDob.setFullYear(adultDob.getFullYear() - 21);
    
    const adultStudent = {
      dateOfBirth: adultDob.toISOString(),
      fullName: 'ROBERT SMITH'
    };
    const res = validateGuardianRequirement(adultStudent);
    assert.equal(res.valid, true);
    assert.equal(res.isMinor, false);
  });
});

test('Section B: ID Proof Validation ("At least ONE" rule)', async (t) => {
  await t.test('rejects when no ID proof is provided', () => {
    const res = validateIdProofs({});
    assert.equal(res.valid, false);
    assert.match(res.error, /At least ONE of PAN Card, Driving Licence, Passport, or Voter ID/);
  });

  await t.test('accepts valid PAN card alone', () => {
    const res = validateIdProofs({ panCardNumber: 'ABCDE1234F' });
    assert.equal(res.valid, true);
  });

  await t.test('rejects malformed PAN card', () => {
    const res = validateIdProofs({ panCardNumber: 'INVALID_PAN' });
    assert.equal(res.valid, false);
    assert.match(res.error, /Invalid PAN Card Number format/);
  });

  await t.test('accepts valid Passport alone', () => {
    const res = validateIdProofs({ passportNumber: 'A1234567' });
    assert.equal(res.valid, true);
  });

  await t.test('accepts valid EPIC/Voter ID alone', () => {
    const res = validateIdProofs({ epicNo: 'ABC1234567' });
    assert.equal(res.valid, true);
  });

  await t.test('validates optional APAAR ID: valid 12-digit format passes, invalid fails', () => {
    const validWithApaar = validateIdProofs({
      panCardNumber: 'ABCDE1234F',
      apaarId: '123456789012'
    });
    assert.equal(validWithApaar.valid, true);

    const invalidApaar = validateIdProofs({
      panCardNumber: 'ABCDE1234F',
      apaarId: '12345' // Too short
    });
    assert.equal(invalidApaar.valid, false);
    assert.match(invalidApaar.error, /APAAR ID must be exactly 12 digits/);
  });
});

test('Section F: Text Formatting and Case Normalization', async (t) => {
  await t.test('forces email to lowercase, address to Title Case, and general text to UPPERCASE', () => {
    const rawInput = {
      fullName: 'harshita kushwaha',
      emailAddress: 'Harshita.K@Gmail.COM',
      presentAddress: '123 main civil lines, near park, new delhi',
      category: 'other backward class (obc)',
      gender: 'female',
      otherInfo: 'Candidate requested evening classes'
    };

    const normalized = normalizeStudentData(rawInput);

    assert.equal(normalized.fullName, 'HARSHITA KUSHWAHA');
    assert.equal(normalized.emailAddress, 'harshita.k@gmail.com');
    assert.equal(normalized.presentAddress, '123 Main Civil Lines, Near Park, New Delhi');
    assert.equal(normalized.category, 'OTHER BACKWARD CLASS (OBC)');
    assert.equal(normalized.gender, 'FEMALE');
    // otherInfo is in excludedFields
    assert.equal(normalized.otherInfo, 'Candidate requested evening classes');
  });
});

test('Section C: Fee and Installment EMI Calculation', async (t) => {
  await t.test('computes percentage discount and equal installment split correctly', () => {
    const plan = calculateFeePlan({
      totalFee: 30000,
      discountType: 'percent',
      discountValue: 10, // 10% off -> 3000
      numInstallments: 3,
      startDate: new Date('2026-04-01')
    });

    assert.equal(plan.totalFee, 30000);
    assert.equal(plan.discountAmount, 3000);
    assert.equal(plan.discountPercent, 10);
    assert.equal(plan.netPayable, 27000);
    assert.equal(plan.installments.length, 3);
    assert.equal(plan.installments[0].amount, 9000);
    assert.equal(plan.installments[1].amount, 9000);
    assert.equal(plan.installments[2].amount, 9000);
    assert.equal(plan.installments[0].expectedMonth, 'Apr 2026');
    assert.equal(plan.installments[1].expectedMonth, 'May 2026');
    assert.equal(plan.installments[2].expectedMonth, 'Jun 2026');
  });

  await t.test('computes flat amount discount and adjusts remainder in final installment', () => {
    const plan = calculateFeePlan({
      totalFee: 10000,
      discountType: 'amount',
      discountValue: 1000,
      numInstallments: 3, // 9000 / 3 = 3000
      startDate: new Date('2026-01-15')
    });

    assert.equal(plan.netPayable, 9000);
    assert.equal(plan.installments[0].amount, 3000);
    assert.equal(plan.installments[1].amount, 3000);
    assert.equal(plan.installments[2].amount, 3000);
  });

  await t.test('handles non-divisible installments with remainder in last installment', () => {
    const plan = calculateFeePlan({
      totalFee: 10000,
      discountType: 'amount',
      discountValue: 0,
      numInstallments: 3, // 10000 / 3 = 3333 + 3333 + 3334
      startDate: new Date('2026-01-15')
    });

    assert.equal(plan.netPayable, 10000);
    assert.equal(plan.installments[0].amount, 3333);
    assert.equal(plan.installments[1].amount, 3333);
    assert.equal(plan.installments[2].amount, 3334);
    const sum = plan.installments.reduce((acc, inst) => acc + inst.amount, 0);
    assert.equal(sum, 10000);
  });
});

test('Section D: Overdue Detection and Escalation', async (t) => {
  const referenceDate = new Date('2026-06-15');

  await t.test('pending installment before due date is not overdue', () => {
    const installment = {
      dueDate: new Date('2026-06-20'),
      status: 'Pending'
    };
    const res = checkOverdueStatus(installment, referenceDate);
    assert.equal(res.status, 'Pending');
    assert.equal(res.isOverdue, false);
    assert.equal(res.isEscalated, false);
  });

  await t.test('pending installment 3 days past due date is marked Overdue', () => {
    const installment = {
      dueDate: new Date('2026-06-12'), // 3 days overdue
      status: 'Pending'
    };
    const res = checkOverdueStatus(installment, referenceDate, 7);
    assert.equal(res.status, 'Overdue');
    assert.equal(res.isOverdue, true);
    assert.equal(res.daysOverdue, 3);
    assert.equal(res.isEscalated, false);
  });

  await t.test('pending installment 10 days past due date is marked Escalated', () => {
    const installment = {
      dueDate: new Date('2026-06-05'), // 10 days overdue (> 7 days)
      status: 'Pending'
    };
    const res = checkOverdueStatus(installment, referenceDate, 7);
    assert.equal(res.status, 'Escalated');
    assert.equal(res.isOverdue, true);
    assert.equal(res.daysOverdue, 10);
    assert.equal(res.isEscalated, true);
  });

  await t.test('already paid installment is not flagged overdue even if past dueDate', () => {
    const installment = {
      dueDate: new Date('2026-05-01'),
      status: 'Paid'
    };
    const res = checkOverdueStatus(installment, referenceDate, 7);
    assert.equal(res.status, 'Paid');
    assert.equal(res.isOverdue, false);
  });
});
