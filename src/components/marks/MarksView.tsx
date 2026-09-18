import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Search, 
  Filter, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { useStudents } from '../../context/StudentContext';
import { DEPARTMENTS, SEMESTERS } from '../../data/sampleData';
import { GradeBadge, StatusBadge } from '../common/GradeBadge';

export const MarksView: React.FC = () => {
  const { students, updateSubjectMark } = useStudents();

  // Filters
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0]);
  const [selectedSem, setSelectedSem] = useState<number>(5);
  const [search, setSearch] = useState('');

  // Active student list for this department & semester
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

  // Extract unique subjects for this department & semester
  const subjectsList = useMemo(() => {
    const map = new Map<string, { code: string; name: string; credits: number }>();
    filteredStudents.forEach(s => {
      s.subjects.forEach(sub => {
        if (!map.has(sub.code)) {
          map.set(sub.code, { code: sub.code, name: sub.name, credits: sub.credits });
        }
      });
    });
    return Array.from(map.values());
  }, [filteredStudents]);

  // Subject performance stats
  const subjectStats = useMemo(() => {
    return subjectsList.map(sub => {
      let totalMarks = 0;
      let highest = 0;
      let passCount = 0;
      let count = 0;

      filteredStudents.forEach(s => {
        const studentSub = s.subjects.find(item => item.code === sub.code);
        if (studentSub) {
          count++;
          totalMarks += studentSub.marks;
          if (studentSub.marks > highest) highest = studentSub.marks;
          if (studentSub.marks >= 40) passCount++;
        }
      });

      return {
        ...sub,
        avg: count > 0 ? (totalMarks / count).toFixed(1) : '0',
        highest,
        passRate: count > 0 ? ((passCount / count) * 100).toFixed(0) : '0',
        totalEnrolled: count,
      };
    });
  }, [subjectsList, filteredStudents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            <span>Marks Management & Assessment Matrix</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time marks entry spreadsheet with automatic grade, total, and pass/fail recalculations
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
            <label className="block text-xs font-semibold text-slate-600 mb-1">Filter in Class</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or reg no..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subject Statistics Cards */}
      {subjectStats.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Subject Performance Overview ({selectedDept} • Sem {selectedSem})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {subjectStats.map(stat => (
              <div
                key={stat.code}
                className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {stat.code}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {stat.credits} Cr
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-xs mt-1.5 line-clamp-1" title={stat.name}>
                  {stat.name}
                </h3>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Average</span>
                    <span className="font-bold text-slate-800">{stat.avg}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Highest</span>
                    <span className="font-bold text-emerald-600">{stat.highest}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pass Rate</span>
                    <span className="font-bold text-slate-800">{stat.passRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Marks Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Class Grade Sheet Matrix
            </span>
            <span className="text-xs text-slate-500">
              ({filteredStudents.length} Students Listed)
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-100 border border-rose-300" />
              &lt; 40 Arrear (Fail)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-100 border border-emerald-300" />
              &ge; 80 Distinction
            </span>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No students found for {selectedDept} (Semester {selectedSem}).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 min-w-[200px] sticky left-0 bg-slate-50 z-10 shadow-r">
                    Student Details
                  </th>
                  {subjectsList.map(sub => (
                    <th key={sub.code} className="py-3 px-3 text-center min-w-[110px]">
                      <div className="font-mono text-blue-700">{sub.code}</div>
                      <div className="text-[10px] font-normal text-slate-500 truncate max-w-[100px] mx-auto">
                        {sub.name}
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center min-w-[90px]">Total Marks</th>
                  <th className="py-3 px-3 text-center min-w-[80px]">Avg %</th>
                  <th className="py-3 px-3 text-center min-w-[70px]">Grade</th>
                  <th className="py-3 px-3 text-center min-w-[70px]">GPA</th>
                  <th className="py-3 px-4 text-center min-w-[100px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student Column */}
                    <td className="py-3 px-4 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100 shadow-r">
                      <div className="font-bold text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{student.registerNumber}</div>
                    </td>

                    {/* Subject Marks Input Columns */}
                    {subjectsList.map(sub => {
                      const subjectMark = student.subjects.find(s => s.code === sub.code);
                      const currentMark = subjectMark ? subjectMark.marks : 0;
                      const isFailing = currentMark < 40;
                      const isDistinction = currentMark >= 80;

                      return (
                        <td key={sub.code} className="py-2 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentMark}
                            onChange={e => {
                              const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                              updateSubjectMark(student.id, sub.code, val);
                            }}
                            className={`w-16 mx-auto text-center py-1.5 px-1 rounded-md font-bold text-xs border transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-hidden ${
                              isFailing
                                ? 'bg-rose-50 border-rose-300 text-rose-700 font-black'
                                : isDistinction
                                ? 'bg-emerald-50/50 border-emerald-300 text-emerald-800'
                                : 'bg-white border-slate-200 text-slate-800'
                            }`}
                          />
                        </td>
                      );
                    })}

                    {/* Calculated Summary Columns */}
                    <td className="py-3 px-3 text-center font-bold text-slate-900">
                      {student.totalMarks} <span className="text-[10px] text-slate-400">/{student.maxTotalMarks}</span>
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {student.percentage}%
                    </td>

                    <td className="py-3 px-3 text-center">
                      <GradeBadge grade={student.grade} size="sm" />
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-slate-700">
                      {student.gpa}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={student.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
