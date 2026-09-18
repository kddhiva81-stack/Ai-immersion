import { SubjectMark, AttendanceRecord, GradeLetter, Student } from '../types';

export const PASSING_MARKS_THRESHOLD = 40; // 40% per subject to pass
export const ATTENDANCE_MIN_THRESHOLD = 75; // 75% needed for exam eligibility

export function calculateSubjectGrade(mark: number, maxMarks: number = 100): { grade: GradeLetter; points: number; passed: boolean } {
  const pct = maxMarks > 0 ? (mark / maxMarks) * 100 : 0;
  if (pct < PASSING_MARKS_THRESHOLD) {
    return { grade: 'F', points: 0, passed: false };
  }
  if (pct >= 90) return { grade: 'O', points: 10, passed: true };
  if (pct >= 80) return { grade: 'A+', points: 9, passed: true };
  if (pct >= 70) return { grade: 'A', points: 8, passed: true };
  if (pct >= 60) return { grade: 'B+', points: 7, passed: true };
  if (pct >= 50) return { grade: 'B', points: 6, passed: true };
  return { grade: 'C', points: 5, passed: true };
}

export function calculateStudentMetrics(
  subjects: SubjectMark[],
  attendance: { totalClasses: number; attendedClasses: number }
): {
  totalMarks: number;
  maxTotalMarks: number;
  percentage: number;
  grade: GradeLetter;
  gpa: number;
  status: 'Passed' | 'Failed';
  failedSubjectsCount: number;
  attendancePercentage: number;
  remarks: string;
} {
  const totalMarks = subjects.reduce((sum, s) => sum + (Number(s.marks) || 0), 0);
  const maxTotalMarks = subjects.reduce((sum, s) => sum + (Number(s.maxMarks) || 100), 0);
  
  const percentage = maxTotalMarks > 0 
    ? Number(((totalMarks / maxTotalMarks) * 100).toFixed(2)) 
    : 0;

  // Failed subjects check
  let failedSubjectsCount = 0;
  let totalWeightedPoints = 0;
  let totalCredits = 0;

  subjects.forEach(subject => {
    const cred = subject.credits || 3;
    totalCredits += cred;
    const { points, passed } = calculateSubjectGrade(subject.marks, subject.maxMarks);
    if (!passed) {
      failedSubjectsCount++;
    }
    totalWeightedPoints += points * cred;
  });

  const gpa = totalCredits > 0 
    ? Number((totalWeightedPoints / totalCredits).toFixed(2)) 
    : 0;

  // Overall Status
  const status: 'Passed' | 'Failed' = failedSubjectsCount === 0 && percentage >= PASSING_MARKS_THRESHOLD 
    ? 'Passed' 
    : 'Failed';

  // Overall Grade
  let grade: GradeLetter = 'F';
  if (status === 'Passed') {
    if (percentage >= 90) grade = 'O';
    else if (percentage >= 80) grade = 'A+';
    else if (percentage >= 70) grade = 'A';
    else if (percentage >= 60) grade = 'B+';
    else if (percentage >= 50) grade = 'B';
    else grade = 'C';
  } else {
    grade = 'F';
  }

  // Attendance
  const totalCls = Math.max(0, attendance.totalClasses || 0);
  const attCls = Math.min(totalCls, Math.max(0, attendance.attendedClasses || 0));
  const attendancePercentage = totalCls > 0 ? Number(((attCls / totalCls) * 100).toFixed(1)) : 0;

  let remarks = 'Good standing';
  if (status === 'Failed') {
    remarks = `Needs improvement: ${failedSubjectsCount} arrear(s)`;
  } else if (attendancePercentage < ATTENDANCE_MIN_THRESHOLD) {
    remarks = 'Attendance shortage alert (<75%)';
  } else if (percentage >= 85) {
    remarks = 'Dean\'s Honor Roll / Top tier';
  }

  return {
    totalMarks,
    maxTotalMarks,
    percentage,
    grade,
    gpa,
    status,
    failedSubjectsCount,
    attendancePercentage,
    remarks,
  };
}

export function getGradeColor(grade: GradeLetter): { bg: string; text: string; border: string } {
  switch (grade) {
    case 'O':
      return { bg: 'bg-emerald-50 text-emerald-700', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'A+':
      return { bg: 'bg-teal-50 text-teal-700', text: 'text-teal-700', border: 'border-teal-200' };
    case 'A':
      return { bg: 'bg-blue-50 text-blue-700', text: 'text-blue-700', border: 'border-blue-200' };
    case 'B+':
      return { bg: 'bg-indigo-50 text-indigo-700', text: 'text-indigo-700', border: 'border-indigo-200' };
    case 'B':
      return { bg: 'bg-amber-50 text-amber-700', text: 'text-amber-700', border: 'border-amber-200' };
    case 'C':
      return { bg: 'bg-orange-50 text-orange-700', text: 'text-orange-700', border: 'border-orange-200' };
    case 'F':
      return { bg: 'bg-rose-50 text-rose-700', text: 'text-rose-700', border: 'border-rose-200' };
    default:
      return { bg: 'bg-slate-50 text-slate-700', text: 'text-slate-700', border: 'border-slate-200' };
  }
}

export function getAttendanceColor(percentage: number): { text: string; bg: string; badge: string; label: string } {
  if (percentage >= 85) {
    return { text: 'text-emerald-600', bg: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Excellent' };
  }
  if (percentage >= 75) {
    return { text: 'text-blue-600', bg: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Eligible' };
  }
  if (percentage >= 65) {
    return { text: 'text-amber-600', bg: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Warning' };
  }
  return { text: 'text-rose-600', bg: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Critical' };
}
