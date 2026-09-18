import React from 'react';
import { 
  X, 
  Printer, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  GraduationCap,
  Award,
  Clock
} from 'lucide-react';
import { Student } from '../../types';
import { GradeBadge, StatusBadge } from '../common/GradeBadge';
import { ProgressBar } from '../common/ProgressBar';
import { calculateSubjectGrade, getAttendanceColor } from '../../utils/calculations';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
  onEdit: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onEdit,
}) => {
  if (!student) return null;

  const attColor = getAttendanceColor(student.attendance.percentage);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full my-6 flex flex-col max-h-[92vh]">
        {/* Header with print/edit/close */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span>Official Academic Profile & Mark Sheet</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 text-xs font-semibold border border-slate-200"
              title="Print Student Report Card"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Card</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
            >
              Edit Details
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content (Printable area) */}
        <div id="printable-student-card" className="overflow-y-auto px-6 py-6 space-y-6 flex-1">
          {/* Student Profile Card Header */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-xs">
                {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
                  <StatusBadge status={student.status} size="sm" />
                </div>
                <p className="text-sm font-semibold text-blue-600 font-mono mt-0.5">
                  {student.registerNumber}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {student.department} • Semester {student.semester}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5 bg-white p-3 rounded-lg border border-slate-200/80 w-full sm:w-auto">
              <div className="text-xs text-slate-500 font-medium">Overall Standing</div>
              <div className="flex items-center gap-2">
                <GradeBadge grade={student.grade} size="md" />
                <span className="text-sm font-bold text-slate-900">GPA {student.gpa}</span>
              </div>
              <div className="text-[11px] text-slate-600 font-medium">{student.remarks}</div>
            </div>
          </div>

          {/* Contact and Academic Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-400 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> Email
              </div>
              <div className="font-semibold text-slate-800 truncate" title={student.email}>
                {student.email}
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-400 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Phone
              </div>
              <div className="font-semibold text-slate-800">
                {student.phone || 'N/A'}
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Admission
              </div>
              <div className="font-semibold text-slate-800">
                Class of {student.admissionYear}
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-400 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Attendance
              </div>
              <div className={`font-bold ${attColor.text}`}>
                {student.attendance.percentage}% ({attColor.label})
              </div>
            </div>
          </div>

          {/* Academic Assessment & Subject Marks Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Subject Marks & Grade Points</span>
              </h3>
              <span className="text-xs font-semibold text-slate-600">
                Total Score: {student.totalMarks} / {student.maxTotalMarks} ({student.percentage}%)
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-4">Code</th>
                    <th className="py-2.5 px-4">Subject Title</th>
                    <th className="py-2.5 px-4 text-center">Credits</th>
                    <th className="py-2.5 px-4 text-center">Marks</th>
                    <th className="py-2.5 px-4 text-center">Grade</th>
                    <th className="py-2.5 px-4 text-center">Points</th>
                    <th className="py-2.5 px-4 text-center">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {student.subjects.map((sub, idx) => {
                    const gradeInfo = calculateSubjectGrade(sub.marks, sub.maxMarks);
                    return (
                      <tr key={idx} className={!gradeInfo.passed ? 'bg-rose-50/50' : 'hover:bg-slate-50/50'}>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-700">{sub.code}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">{sub.name}</td>
                        <td className="py-3 px-4 text-center text-slate-600">{sub.credits}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-900">
                          {sub.marks} <span className="text-slate-400 font-normal">/ {sub.maxMarks}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <GradeBadge grade={gradeInfo.grade} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-700">{gradeInfo.points}</td>
                        <td className="py-3 px-4 text-center">
                          {gradeInfo.passed ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                              <XCircle className="w-3.5 h-3.5" /> Arrear
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50/80 font-bold border-t border-slate-200 text-slate-900">
                    <td colSpan={2} className="py-3 px-4 text-right">Cumulative Summary:</td>
                    <td className="py-3 px-4 text-center">
                      {student.subjects.reduce((sum, s) => sum + s.credits, 0)} Credits
                    </td>
                    <td className="py-3 px-4 text-center text-blue-600 text-sm">
                      {student.totalMarks} / {student.maxTotalMarks}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <GradeBadge grade={student.grade} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-center text-blue-700 font-bold">
                      GPA: {student.gpa}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={student.status} size="sm" />
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Attendance Compliance Meter */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Attendance Compliance & Examination Eligibility
              </h3>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${attColor.badge}`}>
                {student.attendance.percentage}% ({attColor.label})
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Institutional criteria requires minimum 75% aggregate class attendance to be eligible for semester end exams.
            </p>
            <ProgressBar
              value={student.attendance.percentage}
              size="lg"
              showLabel={false}
              colorType="attendance"
            />
            <div className="flex justify-between items-center text-xs text-slate-600 mt-2 font-medium">
              <span>Classes Attended: <strong>{student.attendance.attendedClasses}</strong></span>
              <span>Total Working Sessions: <strong>{student.attendance.totalClasses}</strong></span>
              <span>
                Absences: <strong>{student.attendance.totalClasses - student.attendance.attendedClasses}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
