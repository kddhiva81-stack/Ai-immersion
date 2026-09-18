import { Student, SubjectMark } from '../types';
import { calculateStudentMetrics } from '../utils/calculations';

export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Information Technology',
  'Mechanical Engineering',
  'Civil Engineering',
];

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const DEFAULT_SUBJECT_TEMPLATES: Record<string, SubjectMark[]> = {
  'Computer Science & Engineering': [
    { code: 'CS501', name: 'Design & Analysis of Algorithms', credits: 4, marks: 85, maxMarks: 100 },
    { code: 'CS502', name: 'Database Management Systems', credits: 4, marks: 88, maxMarks: 100 },
    { code: 'CS503', name: 'Operating Systems', credits: 3, marks: 78, maxMarks: 100 },
    { code: 'CS504', name: 'Computer Networks', credits: 3, marks: 82, maxMarks: 100 },
    { code: 'CS505', name: 'Software Engineering', credits: 3, marks: 90, maxMarks: 100 },
  ],
  'Electronics & Communication': [
    { code: 'EC501', name: 'Digital Signal Processing', credits: 4, marks: 76, maxMarks: 100 },
    { code: 'EC502', name: 'Microprocessors & Microcontrollers', credits: 4, marks: 80, maxMarks: 100 },
    { code: 'EC503', name: 'Analog & Digital Communication', credits: 3, marks: 74, maxMarks: 100 },
    { code: 'EC504', name: 'Electromagnetic Fields', credits: 3, marks: 68, maxMarks: 100 },
    { code: 'EC505', name: 'VLSI Design Basics', credits: 3, marks: 85, maxMarks: 100 },
  ],
  'Information Technology': [
    { code: 'IT501', name: 'Web Technologies & Frameworks', credits: 4, marks: 88, maxMarks: 100 },
    { code: 'IT502', name: 'Cloud Computing & Virtualization', credits: 4, marks: 82, maxMarks: 100 },
    { code: 'IT503', name: 'Information Security', credits: 3, marks: 75, maxMarks: 100 },
    { code: 'IT504', name: 'Mobile App Development', credits: 3, marks: 91, maxMarks: 100 },
    { code: 'IT505', name: 'Data Mining & Warehousing', credits: 3, marks: 80, maxMarks: 100 },
  ],
  'Mechanical Engineering': [
    { code: 'ME501', name: 'Thermodynamics & Heat Transfer', credits: 4, marks: 70, maxMarks: 100 },
    { code: 'ME502', name: 'Fluid Mechanics & Machinery', credits: 4, marks: 72, maxMarks: 100 },
    { code: 'ME503', name: 'Design of Machine Elements', credits: 4, marks: 65, maxMarks: 100 },
    { code: 'ME504', name: 'Manufacturing Technology', credits: 3, marks: 84, maxMarks: 100 },
    { code: 'ME505', name: 'Industrial Engineering', credits: 3, marks: 78, maxMarks: 100 },
  ],
  'Civil Engineering': [
    { code: 'CE501', name: 'Structural Analysis & Design', credits: 4, marks: 75, maxMarks: 100 },
    { code: 'CE502', name: 'Geotechnical Engineering', credits: 4, marks: 80, maxMarks: 100 },
    { code: 'CE503', name: 'Environmental Engineering', credits: 3, marks: 77, maxMarks: 100 },
    { code: 'CE504', name: 'Transportation Engineering', credits: 3, marks: 71, maxMarks: 100 },
    { code: 'CE505', name: 'Surveying & Remote Sensing', credits: 3, marks: 83, maxMarks: 100 },
  ],
};

function createStudentEntry(
  id: string,
  name: string,
  registerNumber: string,
  department: string,
  semester: number,
  email: string,
  gender: 'Male' | 'Female' | 'Other',
  admissionYear: number,
  subjectMarks: { code: string; name: string; credits: number; marks: number }[],
  totalClasses: number,
  attendedClasses: number,
  phone?: string
): Student {
  const subjects: SubjectMark[] = subjectMarks.map(s => ({
    ...s,
    maxMarks: 100,
  }));

  const metrics = calculateStudentMetrics(subjects, { totalClasses, attendedClasses });

  return {
    id,
    name,
    registerNumber,
    department,
    semester,
    email,
    phone: phone || '+1 (555) 234-5678',
    gender,
    admissionYear,
    subjects,
    attendance: {
      totalClasses,
      attendedClasses,
      percentage: metrics.attendancePercentage,
      lastUpdated: '2026-09-15',
    },
    totalMarks: metrics.totalMarks,
    maxTotalMarks: metrics.maxTotalMarks,
    percentage: metrics.percentage,
    grade: metrics.grade,
    gpa: metrics.gpa,
    status: metrics.status,
    failedSubjectsCount: metrics.failedSubjectsCount,
    remarks: metrics.remarks,
  };
}

export const INITIAL_STUDENTS: Student[] = [
  createStudentEntry(
    'stu-101',
    'Aarav Sharma',
    'REG2024CS01',
    'Computer Science & Engineering',
    5,
    'aarav.sharma@campus.edu',
    'Male',
    2023,
    [
      { code: 'CS501', name: 'Design & Analysis of Algorithms', credits: 4, marks: 94 },
      { code: 'CS502', name: 'Database Management Systems', credits: 4, marks: 96 },
      { code: 'CS503', name: 'Operating Systems', credits: 3, marks: 91 },
      { code: 'CS504', name: 'Computer Networks', credits: 3, marks: 89 },
      { code: 'CS505', name: 'Software Engineering', credits: 3, marks: 95 },
    ],
    85,
    82,
    '+1 (555) 431-9011'
  ),
  createStudentEntry(
    'stu-102',
    'Elena Rostova',
    'REG2024CS02',
    'Computer Science & Engineering',
    5,
    'elena.rostova@campus.edu',
    'Female',
    2023,
    [
      { code: 'CS501', name: 'Design & Analysis of Algorithms', credits: 4, marks: 84 },
      { code: 'CS502', name: 'Database Management Systems', credits: 4, marks: 87 },
      { code: 'CS503', name: 'Operating Systems', credits: 3, marks: 82 },
      { code: 'CS504', name: 'Computer Networks', credits: 3, marks: 80 },
      { code: 'CS505', name: 'Software Engineering', credits: 3, marks: 89 },
    ],
    85,
    78,
    '+1 (555) 431-9012'
  ),
  createStudentEntry(
    'stu-103',
    'Marcus Chen',
    'REG2024CS03',
    'Computer Science & Engineering',
    5,
    'marcus.chen@campus.edu',
    'Male',
    2023,
    [
      { code: 'CS501', name: 'Design & Analysis of Algorithms', credits: 4, marks: 36 }, // Arrear
      { code: 'CS502', name: 'Database Management Systems', credits: 4, marks: 62 },
      { code: 'CS503', name: 'Operating Systems', credits: 3, marks: 54 },
      { code: 'CS504', name: 'Computer Networks', credits: 3, marks: 48 },
      { code: 'CS505', name: 'Software Engineering', credits: 3, marks: 58 },
    ],
    85,
    58, // 68.2% attendance - warning
    '+1 (555) 431-9013'
  ),
  createStudentEntry(
    'stu-104',
    'Sophia Martinez',
    'REG2024IT01',
    'Information Technology',
    5,
    'sophia.m@campus.edu',
    'Female',
    2023,
    [
      { code: 'IT501', name: 'Web Technologies & Frameworks', credits: 4, marks: 95 },
      { code: 'IT502', name: 'Cloud Computing & Virtualization', credits: 4, marks: 92 },
      { code: 'IT503', name: 'Information Security', credits: 3, marks: 88 },
      { code: 'IT504', name: 'Mobile App Development', credits: 3, marks: 97 },
      { code: 'IT505', name: 'Data Mining & Warehousing', credits: 3, marks: 93 },
    ],
    90,
    88,
    '+1 (555) 431-9014'
  ),
  createStudentEntry(
    'stu-105',
    'Devendra Patel',
    'REG2024IT02',
    'Information Technology',
    5,
    'devendra.p@campus.edu',
    'Male',
    2023,
    [
      { code: 'IT501', name: 'Web Technologies & Frameworks', credits: 4, marks: 78 },
      { code: 'IT502', name: 'Cloud Computing & Virtualization', credits: 4, marks: 74 },
      { code: 'IT503', name: 'Information Security', credits: 3, marks: 80 },
      { code: 'IT504', name: 'Mobile App Development', credits: 3, marks: 82 },
      { code: 'IT505', name: 'Data Mining & Warehousing', credits: 3, marks: 76 },
    ],
    90,
    75,
    '+1 (555) 431-9015'
  ),
  createStudentEntry(
    'stu-106',
    'Priya Nair',
    'REG2024EC01',
    'Electronics & Communication',
    5,
    'priya.nair@campus.edu',
    'Female',
    2023,
    [
      { code: 'EC501', name: 'Digital Signal Processing', credits: 4, marks: 89 },
      { code: 'EC502', name: 'Microprocessors & Microcontrollers', credits: 4, marks: 92 },
      { code: 'EC503', name: 'Analog & Digital Communication', credits: 3, marks: 86 },
      { code: 'EC504', name: 'Electromagnetic Fields', credits: 3, marks: 84 },
      { code: 'EC505', name: 'VLSI Design Basics', credits: 3, marks: 94 },
    ],
    80,
    76,
    '+1 (555) 431-9016'
  ),
  createStudentEntry(
    'stu-107',
    'Liam O\'Connor',
    'REG2024EC02',
    'Electronics & Communication',
    5,
    'liam.oc@campus.edu',
    'Male',
    2023,
    [
      { code: 'EC501', name: 'Digital Signal Processing', credits: 4, marks: 62 },
      { code: 'EC502', name: 'Microprocessors & Microcontrollers', credits: 4, marks: 68 },
      { code: 'EC503', name: 'Analog & Digital Communication', credits: 3, marks: 59 },
      { code: 'EC504', name: 'Electromagnetic Fields', credits: 3, marks: 32 }, // Arrear
      { code: 'EC505', name: 'VLSI Design Basics', credits: 3, marks: 65 },
    ],
    80,
    52, // 65% critical
    '+1 (555) 431-9017'
  ),
  createStudentEntry(
    'stu-108',
    'Fatima Al-Mansoor',
    'REG2024ME01',
    'Mechanical Engineering',
    5,
    'fatima.am@campus.edu',
    'Female',
    2023,
    [
      { code: 'ME501', name: 'Thermodynamics & Heat Transfer', credits: 4, marks: 82 },
      { code: 'ME502', name: 'Fluid Mechanics & Machinery', credits: 4, marks: 88 },
      { code: 'ME503', name: 'Design of Machine Elements', credits: 4, marks: 85 },
      { code: 'ME504', name: 'Manufacturing Technology', credits: 3, marks: 91 },
      { code: 'ME505', name: 'Industrial Engineering', credits: 3, marks: 86 },
    ],
    88,
    84,
    '+1 (555) 431-9018'
  ),
  createStudentEntry(
    'stu-109',
    'Lucas Silva',
    'REG2024ME02',
    'Mechanical Engineering',
    5,
    'lucas.silva@campus.edu',
    'Male',
    2023,
    [
      { code: 'ME501', name: 'Thermodynamics & Heat Transfer', credits: 4, marks: 68 },
      { code: 'ME502', name: 'Fluid Mechanics & Machinery', credits: 4, marks: 71 },
      { code: 'ME503', name: 'Design of Machine Elements', credits: 4, marks: 64 },
      { code: 'ME504', name: 'Manufacturing Technology', credits: 3, marks: 74 },
      { code: 'ME505', name: 'Industrial Engineering', credits: 3, marks: 70 },
    ],
    88,
    72,
    '+1 (555) 431-9019'
  ),
  createStudentEntry(
    'stu-110',
    'Zoe Takahashi',
    'REG2024CE01',
    'Civil Engineering',
    5,
    'zoe.t@campus.edu',
    'Female',
    2023,
    [
      { code: 'CE501', name: 'Structural Analysis & Design', credits: 4, marks: 93 },
      { code: 'CE502', name: 'Geotechnical Engineering', credits: 4, marks: 90 },
      { code: 'CE503', name: 'Environmental Engineering', credits: 3, marks: 87 },
      { code: 'CE504', name: 'Transportation Engineering', credits: 3, marks: 85 },
      { code: 'CE505', name: 'Surveying & Remote Sensing', credits: 3, marks: 92 },
    ],
    84,
    81,
    '+1 (555) 431-9020'
  ),
  createStudentEntry(
    'stu-111',
    'Carlos Gomez',
    'REG2024CE02',
    'Civil Engineering',
    5,
    'carlos.g@campus.edu',
    'Male',
    2023,
    [
      { code: 'CE501', name: 'Structural Analysis & Design', credits: 4, marks: 58 },
      { code: 'CE502', name: 'Geotechnical Engineering', credits: 4, marks: 64 },
      { code: 'CE503', name: 'Environmental Engineering', credits: 3, marks: 62 },
      { code: 'CE504', name: 'Transportation Engineering', credits: 3, marks: 55 },
      { code: 'CE505', name: 'Surveying & Remote Sensing', credits: 3, marks: 66 },
    ],
    84,
    70,
    '+1 (555) 431-9021'
  ),
  createStudentEntry(
    'stu-112',
    'Ananya Das',
    'REG2024CS04',
    'Computer Science & Engineering',
    5,
    'ananya.das@campus.edu',
    'Female',
    2023,
    [
      { code: 'CS501', name: 'Design & Analysis of Algorithms', credits: 4, marks: 98 },
      { code: 'CS502', name: 'Database Management Systems', credits: 4, marks: 99 },
      { code: 'CS503', name: 'Operating Systems', credits: 3, marks: 94 },
      { code: 'CS504', name: 'Computer Networks', credits: 3, marks: 96 },
      { code: 'CS505', name: 'Software Engineering', credits: 3, marks: 97 },
    ],
    85,
    84,
    '+1 (555) 431-9022'
  ),
];
