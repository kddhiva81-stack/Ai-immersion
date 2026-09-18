import React, { useState, useMemo } from 'react';
import { 
  CalendarCheck, 
  Search, 
  Check, 
  X, 
  AlertTriangle, 
  Users, 
  Clock,
  CheckCheck,
  Send,
  Calendar
} from 'lucide-react';
import { useStudents } from '../../context/StudentContext';
import { DEPARTMENTS, SEMESTERS } from '../../data/sampleData';
import { ProgressBar } from '../common/ProgressBar';
import { getAttendanceColor } from '../../utils/calculations';

export const AttendanceView: React.FC = () => {
  const { students, updateStudentAttendance, markBatchAttendance, setSelectedStudentForDetail } = useStudents();

  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0]);
  const [selectedSem, setSelectedSem] = useState<number>(5);
  const [search, setSearch] = useState('');
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dailyStatusMap, setDailyStatusMap] = useState<Record<string, boolean>>({});

  // Active students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchDept = s.department === selectedDept;
      const matchSem = s.semester === selectedSem;
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.registerNumber.toLowerCase().includes(search.toLowerCase());
      return matchDept && matchSem && matchSearch;
    });
  }, [students, selectedDept, selectedSem, search]);

  // Overall attendance metrics
  const totalInClass = filteredStudents.length;
  const avgAtt = totalInClass > 0
    ? (filteredStudents.reduce((sum, s) => sum + s.attendance.percentage, 0) / totalInClass).toFixed(1)
    : '0';

  const eligibleCount = filteredStudents.filter(s => s.attendance.percentage >= 75).length;
  const warningCount = filteredStudents.filter(
    s => s.attendance.percentage >= 65 && s.attendance.percentage < 75
  ).length;
  const criticalCount = filteredStudents.filter(s => s.attendance.percentage < 65).length;

  const handleMarkAllPresent = () => {
    const map: Record<string, boolean> = {};
    filteredStudents.forEach(s => {
      map[s.id] = true;
    });
    setDailyStatusMap(map);
  };

  const handleToggleDaily = (studentId: string) => {
    setDailyStatusMap(prev => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleCommitDailySession = () => {
    // Commit attendance for all students in this view
    filteredStudents.forEach(s => {
      const isPresent = dailyStatusMap[s.id] !== false; // default present if not explicitly unchecked
      markBatchAttendance([s.id], isPresent);
    });
    alert(`Attendance for ${sessionDate} submitted successfully! Records updated.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-blue-600" />
            <span>Attendance Tracking & Compliance</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor institutional attendance records, conduct daily roll-calls, and enforce exam eligibility
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {SEMESTERS.map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Search Student</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or reg no..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Class Attendance</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{avgAtt}%</div>
          <p className="text-xs text-slate-500 mt-1">{totalInClass} students enrolled</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Exam Eligible (≥75%)</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{eligibleCount}</div>
          <p className="text-xs text-slate-500 mt-1">{totalInClass > 0 ? ((eligibleCount/totalInClass)*100).toFixed(0) : 0}% of cohort</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Warning Zone (65-74%)</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{warningCount}</div>
          <p className="text-xs text-slate-500 mt-1">Requires condonation</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Critical / Detained (&lt;65%)</span>
          <div className="text-2xl font-bold text-rose-700 mt-1">{criticalCount}</div>
          <p className="text-xs text-slate-500 mt-1">Ineligible for exam</p>
        </div>
      </div>

      {/* Daily Roll Call Action Box */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Daily Attendance Roll-Call Mode</span>
          </div>
          <h2 className="text-lg font-bold mt-1">Mark Class Session for {selectedDept}</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Log today's lecture attendance. Click 'Present' or 'Absent' next to each student below, then save.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="date"
            value={sessionDate}
            onChange={e => setSessionDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-semibold focus:outline-hidden"
          />
          <button
            onClick={handleMarkAllPresent}
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Mark All Present</span>
          </button>
          <button
            onClick={handleCommitDailySession}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Session</span>
          </button>
        </div>
      </div>

      {/* Student Attendance List & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
            Cohort Attendance Registry ({filteredStudents.length} Students)
          </h3>
          <span className="text-xs text-slate-500">
            Click +/- or enter values to adjust historical totals
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {filteredStudents.map(student => {
            const attColor = getAttendanceColor(student.attendance.percentage);
            const isDailyChecked = dailyStatusMap[student.id] !== false;

            return (
              <div
                key={student.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                {/* Student Info */}
                <div className="flex items-center gap-3 min-w-[240px]">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                    {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4
                      onClick={() => setSelectedStudentForDetail(student)}
                      className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer text-sm"
                    >
                      {student.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {student.registerNumber} • Sem {student.semester}
                    </p>
                  </div>
                </div>

                {/* Progress Bar & Rate */}
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-700">
                      {student.attendance.attendedClasses} / {student.attendance.totalClasses} Classes
                    </span>
                    <span className={`font-bold px-2 py-0.5 rounded border text-[10px] ${attColor.badge}`}>
                      {student.attendance.percentage}% ({attColor.label})
                    </span>
                  </div>
                  <ProgressBar
                    value={student.attendance.percentage}
                    size="sm"
                    showLabel={false}
                    colorType="attendance"
                  />
                </div>

                {/* Quick Editor Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
                    <span className="text-[11px] text-slate-500 px-1">Attended:</span>
                    <button
                      onClick={() => {
                        const newAtt = Math.max(0, student.attendance.attendedClasses - 1);
                        updateStudentAttendance(student.id, newAtt, student.attendance.totalClasses);
                      }}
                      className="w-6 h-6 rounded bg-white hover:bg-slate-100 border border-slate-200 font-bold text-slate-700 flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={student.attendance.totalClasses}
                      value={student.attendance.attendedClasses}
                      onChange={e => {
                        const val = Math.min(student.attendance.totalClasses, Math.max(0, Number(e.target.value) || 0));
                        updateStudentAttendance(student.id, val, student.attendance.totalClasses);
                      }}
                      className="w-12 text-center text-xs font-bold bg-white border border-slate-200 rounded py-0.5"
                    />
                    <button
                      onClick={() => {
                        const newAtt = Math.min(student.attendance.totalClasses, student.attendance.attendedClasses + 1);
                        updateStudentAttendance(student.id, newAtt, student.attendance.totalClasses);
                      }}
                      className="w-6 h-6 rounded bg-white hover:bg-slate-100 border border-slate-200 font-bold text-slate-700 flex items-center justify-center"
                    >
                      +
                    </button>
                    <span className="text-[11px] text-slate-400">/ {student.attendance.totalClasses}</span>
                  </div>

                  {/* Daily Roll Call Toggle */}
                  <button
                    onClick={() => handleToggleDaily(student.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isDailyChecked
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : 'bg-rose-50 text-rose-700 border border-rose-300'
                    }`}
                  >
                    {isDailyChecked ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>{isDailyChecked ? 'Present' : 'Absent'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
