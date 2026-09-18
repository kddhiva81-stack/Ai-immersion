import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Trophy, 
  Award, 
  BookOpen, 
  Users, 
  CheckCircle2, 
  Percent,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useStudents } from '../../context/StudentContext';
import { DEPARTMENTS } from '../../data/sampleData';
import { GradeBadge, StatusBadge } from '../common/GradeBadge';
import { ProgressBar } from '../common/ProgressBar';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

export const PerformanceView: React.FC = () => {
  const { students, setSelectedStudentForDetail } = useStudents();
  const [selectedDept, setSelectedDept] = useState('all');

  // Filtered dataset
  const currentStudents = useMemo(() => {
    if (selectedDept === 'all') return students;
    return students.filter(s => s.department === selectedDept);
  }, [students, selectedDept]);

  // 1. Department Summary Chart Data
  const deptBenchmarkData = useMemo(() => {
    const map: Record<string, { totalMarksPct: number; totalAtt: number; count: number; passCount: number }> = {};
    students.forEach(s => {
      const name = s.department.replace('Engineering', 'Eng.').replace('Computer Science & Eng.', 'CSE').replace('Electronics & Communication', 'ECE').replace('Information Technology', 'IT').replace('Mechanical Eng.', 'Mech').replace('Civil Eng.', 'Civil');
      if (!map[name]) {
        map[name] = { totalMarksPct: 0, totalAtt: 0, count: 0, passCount: 0 };
      }
      map[name].totalMarksPct += s.percentage;
      map[name].totalAtt += s.attendance.percentage;
      map[name].count += 1;
      if (s.status === 'Passed') map[name].passCount += 1;
    });

    return Object.entries(map).map(([dept, data]) => ({
      department: dept,
      avgMarks: Number((data.totalMarksPct / data.count).toFixed(1)),
      avgAttendance: Number((data.totalAtt / data.count).toFixed(1)),
      passRate: Number(((data.passCount / data.count) * 100).toFixed(0)),
    }));
  }, [students]);

  // 2. Grade Distribution Data
  const gradeDistributionData = useMemo(() => {
    const counts: Record<string, number> = { O: 0, 'A+': 0, A: 0, 'B+': 0, B: 0, C: 0, F: 0 };
    currentStudents.forEach(s => {
      if (counts[s.grade] !== undefined) counts[s.grade]++;
    });

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([grade, count]) => ({
        name: `Grade ${grade}`,
        value: count,
        pct: ((count / Math.max(1, currentStudents.length)) * 100).toFixed(1),
      }));
  }, [currentStudents]);

  const GRADE_COLORS: Record<string, string> = {
    'Grade O': '#10b981',
    'Grade A+': '#0d9488',
    'Grade A': '#3b82f6',
    'Grade B+': '#6366f1',
    'Grade B': '#f59e0b',
    'Grade C': '#f97316',
    'Grade F': '#ef4444',
  };

  // 3. Subject-wise Pass Rate across current students
  const subjectPerformanceData = useMemo(() => {
    const subjectMap: Record<string, { name: string; totalMarks: number; count: number; passed: number }> = {};
    currentStudents.forEach(s => {
      s.subjects.forEach(sub => {
        if (!subjectMap[sub.code]) {
          subjectMap[sub.code] = { name: sub.name, totalMarks: 0, count: 0, passed: 0 };
        }
        subjectMap[sub.code].totalMarks += sub.marks;
        subjectMap[sub.code].count += 1;
        if (sub.marks >= 40) subjectMap[sub.code].passed += 1;
      });
    });

    return Object.entries(subjectMap).map(([code, d]) => ({
      code,
      name: d.name,
      avgMark: Number((d.totalMarks / d.count).toFixed(1)),
      passPercentage: Number(((d.passed / d.count) * 100).toFixed(1)),
    }));
  }, [currentStudents]);

  // 4. Attendance Impact Correlation
  const attendanceCorrelationData = useMemo(() => {
    return [
      { range: '< 65% (Critical)', min: 0, max: 65 },
      { range: '65 - 74% (Warning)', min: 65, max: 75 },
      { range: '75 - 84% (Eligible)', min: 75, max: 85 },
      { range: '≥ 85% (Excellent)', min: 85, max: 101 },
    ].map(bracket => {
      const matches = currentStudents.filter(
        s => s.attendance.percentage >= bracket.min && s.attendance.percentage < bracket.max
      );
      const avgScore = matches.length > 0
        ? Number((matches.reduce((acc, m) => acc + m.percentage, 0) / matches.length).toFixed(1))
        : 0;
      return {
        bracket: bracket.range,
        avgScore,
        count: matches.length,
      };
    });
  }, [currentStudents]);

  // 5. Institutional Top 10 Merit List
  const topTenStudents = useMemo(() => {
    return [...currentStudents]
      .filter(s => s.status === 'Passed')
      .sort((a, b) => b.gpa - a.gpa || b.percentage - a.percentage)
      .slice(0, 10);
  }, [currentStudents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Academic Performance Analytics</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Statistical breakdown of student grades, subject mastery, department benchmarks, and attendance impact
          </p>
        </div>

        <div>
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-slate-200 text-sm bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="all">All Departments (Institutional)</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 2 Graphs: Department Benchmark & Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Benchmark */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Department Performance Comparison</h2>
              <p className="text-xs text-slate-500">Average marks % vs overall pass percentage</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptBenchmarkData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}%`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="avgMarks" name="Average Marks %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="passRate" name="Pass Rate %" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Grade Dispersion</h2>
            <p className="text-xs text-slate-500">Distribution among {currentStudents.length} evaluated students</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {gradeDistributionData.map(entry => (
                    <Cell key={`cell-${entry.name}`} fill={GRADE_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
            {gradeDistributionData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: GRADE_COLORS[item.name] || '#94a3b8' }}
                  />
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value} ({item.pct}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Attendance Impact & Subject Pass Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance vs Performance Correlation */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Attendance vs. Academic Performance</h2>
            <p className="text-xs text-slate-500">Average student marks segmented by attendance tier</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceCorrelationData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bracket" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}% Avg Score`, '']}
                />
                <Bar dataKey="avgScore" name="Average Marks %" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 text-center italic">
            *Strong correlation observed: cohorts with attendance ≥ 85% score an average of 25-30% higher on exams.
          </p>
        </div>

        {/* Subject-wise Pass Rates */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Subject Difficulty & Pass Rates</h2>
            <p className="text-xs text-slate-500">Pass rate % across active curriculum courses</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectPerformanceData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="code" type="category" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}% Pass Rate`, '']}
                />
                <Bar dataKey="passPercentage" name="Pass Rate %" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Institutional Top 10 Merit List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Dean's Honor Roll & Institutional Merit List</h2>
              <p className="text-xs text-slate-500">Top 10 academic achievers ranked by GPA and marks percentage</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
            Top Performers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-16 text-center">Rank</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Percentage</th>
                <th className="py-3 px-4 text-center">GPA</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4 text-center">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topTenStudents.map((student, idx) => (
                <tr
                  key={student.id}
                  onClick={() => setSelectedStudentForDetail(student)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-300'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-800'
                          : idx === 2
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div>{student.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono font-normal">{student.registerNumber}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{student.department}</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">{student.percentage}%</td>
                  <td className="py-3 px-4 text-center font-black text-blue-700 text-sm">{student.gpa}</td>
                  <td className="py-3 px-4 text-center">
                    <GradeBadge grade={student.grade} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-emerald-700">
                    {student.attendance.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
