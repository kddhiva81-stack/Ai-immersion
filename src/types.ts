export interface SubjectMark {
  code: string;
  name: string;
  credits: number;
  marks: number;
  maxMarks: number;
}

export interface AttendanceRecord {
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  lastUpdated?: string;
}

export type GradeLetter = 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'F';

export interface Student {
  id: string;
  name: string;
  registerNumber: string;
  department: string;
  semester: number;
  email: string;
  phone?: string;
  gender: 'Male' | 'Female' | 'Other';
  admissionYear: number;
  subjects: SubjectMark[];
  attendance: AttendanceRecord;
  
  // Calculated properties
  totalMarks: number;
  maxTotalMarks: number;
  percentage: number;
  grade: GradeLetter;
  gpa: number;
  status: 'Passed' | 'Failed';
  failedSubjectsCount: number;
  remarks?: string;
}

export type NavigationSection = 
  | 'dashboard'
  | 'students'
  | 'marks'
  | 'attendance'
  | 'performance'
  | 'reports';

export interface FilterOptions {
  search: string;
  department: string;
  semester: string;
  status: string; // 'all' | 'Passed' | 'Failed' | 'at-risk'
  attendanceStatus: string; // 'all' | 'eligible' | 'warning' | 'critical'
  sortBy: 'name' | 'registerNumber' | 'percentage' | 'attendance' | 'semester';
  sortOrder: 'asc' | 'desc';
}

export interface DepartmentSummary {
  name: string;
  studentCount: number;
  avgPercentage: number;
  avgAttendance: number;
  passPercentage: number;
}
