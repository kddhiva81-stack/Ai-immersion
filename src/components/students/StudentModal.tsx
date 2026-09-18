import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, Info } from 'lucide-react';
import { Student, SubjectMark } from '../../types';
import { DEPARTMENTS, SEMESTERS, DEFAULT_SUBJECT_TEMPLATES } from '../../data/sampleData';
import { calculateStudentMetrics, getGradeColor } from '../../utils/calculations';
import { GradeBadge, StatusBadge } from '../common/GradeBadge';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: any) => void;
  studentToEdit?: Student | null;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  studentToEdit,
}) => {
  const isEditing = Boolean(studentToEdit);

  // Form State
  const [name, setName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [semester, setSemester] = useState<number>(5);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [admissionYear, setAdmissionYear] = useState<number>(2023);

  // Subjects & Marks
  const [subjects, setSubjects] = useState<SubjectMark[]>([]);

  // Attendance
  const [totalClasses, setTotalClasses] = useState<number>(80);
  const [attendedClasses, setAttendedClasses] = useState<number>(72);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate or reset form
  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name);
      setRegisterNumber(studentToEdit.registerNumber);
      setDepartment(studentToEdit.department);
      setSemester(studentToEdit.semester);
      setEmail(studentToEdit.email);
      setPhone(studentToEdit.phone || '');
      setGender(studentToEdit.gender);
      setAdmissionYear(studentToEdit.admissionYear);
      setSubjects(studentToEdit.subjects.map(s => ({ ...s })));
      setTotalClasses(studentToEdit.attendance.totalClasses);
      setAttendedClasses(studentToEdit.attendance.attendedClasses);
    } else {
      setName('');
      setRegisterNumber(`REG${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`);
      setDepartment(DEPARTMENTS[0]);
      setSemester(5);
      setEmail('');
      setPhone('+1 (555) 019-2834');
      setGender('Male');
      setAdmissionYear(2023);
      setTotalClasses(80);
      setAttendedClasses(70);
      // Load default subjects for chosen department
      const template = DEFAULT_SUBJECT_TEMPLATES[DEPARTMENTS[0]] || [];
      setSubjects(template.map(s => ({ ...s, marks: 75 })));
    }
    setErrors({});
  }, [studentToEdit, isOpen]);

  // Handle department change for new student
  const handleDepartmentChange = (newDept: string) => {
    setDepartment(newDept);
    if (!isEditing) {
      const template = DEFAULT_SUBJECT_TEMPLATES[newDept] || [];
      if (template.length > 0) {
        setSubjects(template.map(s => ({ ...s, marks: 75 })));
      }
    }
  };

  // Real-time calculated metrics
  const liveMetrics = calculateStudentMetrics(subjects, { totalClasses, attendedClasses });

  const handleSubjectMarkChange = (index: number, value: string) => {
    const num = Math.min(100, Math.max(0, Number(value) || 0));
    setSubjects(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], marks: num };
      return copy;
    });
  };

  const handleSubjectNameChange = (index: number, field: keyof SubjectMark, value: any) => {
    setSubjects(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addSubjectRow = () => {
    const code = `SUB${subjects.length + 1}01`;
    setSubjects(prev => [
      ...prev,
      { code, name: 'New Elective Course', credits: 3, marks: 70, maxMarks: 100 },
    ]);
  };

  const removeSubjectRow = (index: number) => {
    if (subjects.length <= 1) {
      alert('At least one subject is required for academic performance evaluation.');
      return;
    }
    setSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Student name is required';
    if (!registerNumber.trim()) newErrors.registerNumber = 'Register number is required';
    if (!email.trim()) newErrors.email = 'Email address is required';
    if (subjects.length === 0) newErrors.subjects = 'Please add at least one subject';
    if (totalClasses <= 0) newErrors.totalClasses = 'Total classes must be greater than 0';
    if (attendedClasses < 0 || attendedClasses > totalClasses) {
      newErrors.attendedClasses = 'Attended classes cannot exceed total classes';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      name: name.trim(),
      registerNumber: registerNumber.trim(),
      department,
      semester: Number(semester),
      email: email.trim(),
      phone: phone.trim(),
      gender,
      admissionYear: Number(admissionYear),
      subjects,
      attendance: {
        totalClasses: Number(totalClasses),
        attendedClasses: Number(attendedClasses),
      },
    };

    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Student Record' : 'Enroll New Student'}
            </h2>
            <p className="text-xs text-slate-500">
              Fill in student personal details, subject-wise marks, and attendance.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-6 flex-1">
          {/* Automatic Calculation Preview Ribbon */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-blue-900 text-xs font-semibold">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>Live Automatic Evaluation Preview:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="bg-white px-2.5 py-1 rounded-md border border-blue-200">
                <span className="text-slate-500">Total: </span>
                <span className="font-bold text-slate-900">{liveMetrics.totalMarks} / {liveMetrics.maxTotalMarks}</span>
              </div>
              <div className="bg-white px-2.5 py-1 rounded-md border border-blue-200">
                <span className="text-slate-500">Avg %: </span>
                <span className="font-bold text-slate-900">{liveMetrics.percentage}%</span>
              </div>
              <div className="bg-white px-2.5 py-1 rounded-md border border-blue-200">
                <span className="text-slate-500">GPA: </span>
                <span className="font-bold text-slate-900">{liveMetrics.gpa}</span>
              </div>
              <GradeBadge grade={liveMetrics.grade} size="sm" />
              <StatusBadge status={liveMetrics.status} size="sm" />
              <div className="bg-white px-2.5 py-1 rounded-md border border-blue-200">
                <span className="text-slate-500">Attendance: </span>
                <span className={`font-bold ${liveMetrics.attendancePercentage < 75 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {liveMetrics.attendancePercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Basic Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              1. Personal & Academic Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Student Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {errors.name && <p className="text-rose-500 text-[11px] mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Register Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. REG2024CS01"
                  value={registerNumber}
                  onChange={e => setRegisterNumber(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm uppercase"
                />
                {errors.registerNumber && <p className="text-rose-500 text-[11px] mt-1">{errors.registerNumber}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department *
                </label>
                <select
                  value={department}
                  onChange={e => handleDepartmentChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Semester *
                </label>
                <select
                  value={semester}
                  onChange={e => setSemester(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  {SEMESTERS.map(sem => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@campus.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {errors.email && <p className="text-rose-500 text-[11px] mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Admission Year
                </label>
                <input
                  type="number"
                  min="2018"
                  max="2030"
                  value={admissionYear}
                  onChange={e => setAdmissionYear(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Subject Marks Management */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Subjects & Continuous Assessment Marks (Passing &ge; 40)
              </h3>
              <button
                type="button"
                onClick={addSubjectRow}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subject</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3 w-28">Subject Code</th>
                    <th className="py-2.5 px-3">Subject Name</th>
                    <th className="py-2.5 px-3 w-20 text-center">Credits</th>
                    <th className="py-2.5 px-3 w-28 text-center">Marks (0-100)</th>
                    <th className="py-2.5 px-3 w-24 text-center">Status</th>
                    <th className="py-2.5 px-3 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((sub, idx) => {
                    const isFailing = sub.marks < 40;
                    return (
                      <tr key={idx} className={isFailing ? 'bg-rose-50/40' : ''}>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={sub.code}
                            onChange={e => handleSubjectNameChange(idx, 'code', e.target.value.toUpperCase())}
                            className="w-full px-2 py-1 rounded border border-slate-200 uppercase font-mono text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={sub.name}
                            onChange={e => handleSubjectNameChange(idx, 'name', e.target.value)}
                            className="w-full px-2 py-1 rounded border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min="1"
                            max="6"
                            value={sub.credits}
                            onChange={e => handleSubjectNameChange(idx, 'credits', Number(e.target.value) || 3)}
                            className="w-14 text-center px-2 py-1 rounded border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={sub.marks}
                            onChange={e => handleSubjectMarkChange(idx, e.target.value)}
                            className={`w-18 text-center px-2 py-1 rounded font-bold border text-xs ${
                              isFailing ? 'border-rose-400 text-rose-700 bg-rose-50' : 'border-slate-200 text-slate-800'
                            }`}
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          {isFailing ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                              Arrear
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                              Passed
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeSubjectRow(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Remove subject"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {errors.subjects && <p className="text-rose-500 text-[11px] mt-1">{errors.subjects}</p>}
          </div>

          {/* Section 3: Attendance Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              3. Attendance Tracking (Minimum 75% Required)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Total Working Classes *
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={totalClasses}
                  onChange={e => setTotalClasses(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Classes Attended *
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalClasses}
                  value={attendedClasses}
                  onChange={e => setAttendedClasses(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Attendance Percentage & Status
                </label>
                <div className="h-10 flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900">
                    {liveMetrics.attendancePercentage}%
                  </span>
                  {liveMetrics.attendancePercentage >= 75 ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      Exam Eligible
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
                      Shortage (&lt;75%)
                    </span>
                  )}
                </div>
              </div>
            </div>
            {errors.attendedClasses && <p className="text-rose-500 text-[11px] mt-1">{errors.attendedClasses}</p>}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            {isEditing ? 'Save Changes' : 'Enroll Student'}
          </button>
        </div>
      </div>
    </div>
  );
};
