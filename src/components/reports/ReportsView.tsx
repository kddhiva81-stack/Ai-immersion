import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  GraduationCap, 
  Building2, 
  Award, 
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { useStudents } from '../../context/StudentContext';
import { DEPARTMENTS, SEMESTERS } from '../../data/sampleData';
import { GradeBadge, StatusBadge } from '../common/GradeBadge';
import { calculateSubjectGrade, getAttendanceColor } from '../../utils/calculations';

export const ReportsView: React.FC = () => {
  const { students, exportJSON, importJSON, resetToDemoData } = useStudents();

  // Active student for individual transcript
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => students[0]?.id || '');
  const activeStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Consolidated class report filters
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0]);
  const [selectedSem, setSelectedSem] = useState(5);

  const consolidatedStudents = students.filter(
    s => s.department === selectedDept && s.semester === selectedSem
  );

  const [activeReportTab, setActiveReportTab] = useState<'transcript' | 'consolidated' | 'backup'>('transcript');

  const handlePrint = () => {
    window.print();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = importJSON(content);
        if (success) {
          alert('Database imported successfully!');
        } else {
          alert('Invalid JSON file format. Please check the backup file structure.');
        }
      }
    };
    reader.readAsText(file);
  };

  const exportCSV = () => {
    const headers = [
      'Register Number',
      'Name',
      'Department',
      'Semester',
      'Total Marks',
      'Max Marks',
      'Percentage',
      'GPA',
      'Grade',
      'Status',
      'Attended Classes',
      'Total Classes',
      'Attendance %',
    ];

    const rows = consolidatedStudents.map(s => [
      `"${s.registerNumber}"`,
      `"${s.name}"`,
      `"${s.department}"`,
      s.semester,
      s.totalMarks,
      s.maxTotalMarks,
      s.percentage,
      s.gpa,
      `"${s.grade}"`,
      `"${s.status}"`,
      s.attendance.attendedClasses,
      s.attendance.totalClasses,
      s.attendance.percentage,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedDept.replace(/\s+/g, '_')}_Sem${selectedSem}_Marksheet.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <span>Academic Reports & Transcripts</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Generate formal student grade sheets, class broadsheets, and database backups
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveReportTab('transcript')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeReportTab === 'transcript'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Individual Transcript
          </button>
          <button
            onClick={() => setActiveReportTab('consolidated')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeReportTab === 'consolidated'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Class Broadsheet
          </button>
          <button
            onClick={() => setActiveReportTab('backup')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeReportTab === 'backup'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Data Backup / Export
          </button>
        </div>
      </div>

      {/* TAB 1: INDIVIDUAL TRANSCRIPT */}
      {activeReportTab === 'transcript' && activeStudent && (
        <div className="space-y-4">
          {/* Selector & Print Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-80">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Select Student to Generate Transcript:
              </label>
              <select
                value={activeStudent.id}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.registerNumber}) - {s.department}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Transcript / Save PDF</span>
            </button>
          </div>

          {/* Official Printable Academic Transcript Layout */}
          <div
            id="official-transcript"
            className="bg-white rounded-2xl border-2 border-slate-300 p-8 sm:p-12 shadow-sm max-w-4xl mx-auto space-y-6 text-slate-900 font-serif"
          >
            {/* Institution Header */}
            <div className="border-b-2 border-slate-800 pb-6 text-center space-y-1">
              <div className="text-xs uppercase tracking-widest text-slate-500 font-sans font-bold">
                Affiliated to State Technical University • Accredited 'A+' Grade
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
                Apex Institute of Technology & Science
              </h1>
              <p className="text-xs text-slate-600 font-sans">
                Office of the Controller of Examinations • Campus Directorate
              </p>
              <div className="inline-block mt-2 px-4 py-1 rounded bg-slate-100 text-xs font-bold font-sans tracking-wider uppercase border border-slate-300">
                Official Statement of Marks & Grade Card
              </div>
            </div>

            {/* Student Credential Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans border border-slate-200 p-4 rounded-xl bg-slate-50/50">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Candidate Name</span>
                <span className="font-bold text-slate-900 text-sm">{activeStudent.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Register Number</span>
                <span className="font-mono font-bold text-blue-700 text-sm">{activeStudent.registerNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Department / Branch</span>
                <span className="font-bold text-slate-900">{activeStudent.department}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Semester & Session</span>
                <span className="font-bold text-slate-900">Semester {activeStudent.semester} (2025-26)</span>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="font-sans">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-[11px] text-slate-700">
                    <th className="py-2.5 px-3 border-r border-slate-300">Course Code</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Course Title</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">Credits</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">Max</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">Marks Scored</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">Letter Grade</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">Grade Point</th>
                    <th className="py-2.5 px-3 text-center">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeStudent.subjects.map((sub, i) => {
                    const gradeInfo = calculateSubjectGrade(sub.marks, sub.maxMarks);
                    return (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-semibold border-r border-slate-200">{sub.code}</td>
                        <td className="py-2.5 px-3 border-r border-slate-200">{sub.name}</td>
                        <td className="py-2.5 px-2 text-center border-r border-slate-200">{sub.credits}</td>
                        <td className="py-2.5 px-2 text-center border-r border-slate-200 text-slate-500">{sub.maxMarks}</td>
                        <td className="py-2.5 px-2 text-center font-bold border-r border-slate-200">{sub.marks}</td>
                        <td className="py-2.5 px-2 text-center font-bold border-r border-slate-200">
                          {gradeInfo.grade}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold border-r border-slate-200">{gradeInfo.points}</td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {gradeInfo.passed ? (
                            <span className="text-emerald-700">PASS</span>
                          ) : (
                            <span className="text-rose-700">FAIL (ARREAR)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Performance Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans bg-slate-100 p-4 rounded-xl border border-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Aggregate Marks</span>
                <span className="font-bold text-slate-900 text-base">
                  {activeStudent.totalMarks} / {activeStudent.maxTotalMarks} ({activeStudent.percentage}%)
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Semester GPA</span>
                <span className="font-black text-blue-700 text-base">{activeStudent.gpa} / 10.0</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Cumulative Grade</span>
                <span className="font-bold text-slate-900 text-base">Grade {activeStudent.grade}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Semester Result</span>
                <span className={`font-black text-base ${activeStudent.status === 'Passed' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {activeStudent.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Attendance Certification */}
            <div className="text-xs font-sans border-l-4 border-blue-600 bg-blue-50/50 p-3 rounded-r-lg">
              <span className="font-bold text-slate-800">Attendance Certification: </span>
              Candidate attended <strong>{activeStudent.attendance.attendedClasses}</strong> out of{' '}
              <strong>{activeStudent.attendance.totalClasses}</strong> instructional lecture hours (
              <strong>{activeStudent.attendance.percentage}%</strong> aggregate).{' '}
              {activeStudent.attendance.percentage >= 75
                ? 'Candidate satisfies university exam eligibility standards.'
                : 'Candidate is subject to attendance shortage penalties.'}
            </div>

            {/* Signatures */}
            <div className="pt-12 grid grid-cols-3 gap-8 text-center text-xs font-sans">
              <div>
                <div className="border-t border-slate-400 pt-2 font-semibold text-slate-700">Class Incharge / Advisor</div>
              </div>
              <div>
                <div className="border-t border-slate-400 pt-2 font-semibold text-slate-700">Head of Department</div>
              </div>
              <div>
                <div className="border-t border-slate-400 pt-2 font-bold text-slate-900">Controller of Examinations</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONSOLIDATED BROADSHEET */}
      {activeReportTab === 'consolidated' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Semester</label>
                <select
                  value={selectedSem}
                  onChange={e => setSelectedSem(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                >
                  {SEMESTERS.map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportCSV}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Broadsheet</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 uppercase">
                Consolidated Marks Register — {selectedDept} (Semester {selectedSem})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cohort of {consolidatedStudents.length} candidates evaluated
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3 w-12 text-center">#</th>
                    <th className="py-3 px-3">Register No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-3 text-center">Total Marks</th>
                    <th className="py-3 px-3 text-center">Percentage</th>
                    <th className="py-3 px-3 text-center">GPA</th>
                    <th className="py-3 px-3 text-center">Grade</th>
                    <th className="py-3 px-3 text-center">Attendance %</th>
                    <th className="py-3 px-3 text-center">Result Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {consolidatedStudents.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-semibold">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{s.registerNumber}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{s.name}</td>
                      <td className="py-2.5 px-3 text-center font-semibold text-slate-800">
                        {s.totalMarks}/{s.maxTotalMarks}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">{s.percentage}%</td>
                      <td className="py-2.5 px-3 text-center font-black text-blue-700">{s.gpa}</td>
                      <td className="py-2.5 px-3 text-center">
                        <GradeBadge grade={s.grade} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold text-slate-700">
                        {s.attendance.percentage}%
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <StatusBadge status={s.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP / RESTORE / EXPORT */}
      {activeReportTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* JSON Export */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Export JSON Database</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Download the complete system state including all students, marks history, and attendance records as a JSON file.
              </p>
            </div>
            <button
              onClick={exportJSON}
              className="w-full py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* JSON Import */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Import JSON Records</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Restore student records from a previously exported JSON backup file. All metrics and grades are re-validated on import.
              </p>
            </div>
            <label className="w-full py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200">
              <Upload className="w-4 h-4" />
              <span>Choose Backup File</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Reset Demo Data */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Reset Demo Data</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Restore the default academic demonstration dataset with sample students across Computer Science, Electronics, IT, Mechanical, and Civil departments.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Reset all student data to factory demo records?')) {
                  resetToDemoData();
                  alert('Reset to demo records successfully!');
                }
              }}
              className="w-full py-2 px-3 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Sample Data</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
