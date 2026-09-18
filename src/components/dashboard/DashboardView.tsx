import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  Percent, 
  CalendarCheck, 
  AlertTriangle, 
  Trophy, 
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import { useStudents } from '../../context/StudentContext';
import { StatCard } from '../common/StatCard';
import { GradeBadge } from '../common/GradeBadge';
import { ProgressBar } from '../common/ProgressBar';
import { getAttendanceColor } from '../../utils/calculations';
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
  Legend 
} from 'recharts';

interface DashboardViewProps {
  onOpenAddModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenAddModal }) => {
  const { students, setActiveSection, setSelectedStudentForDetail } = useStudents();

  // Calculations
  const totalStudents = students.length;
  const passedStudents = students.filter(s => s.status === 'Passed').length;
  const passRate = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(1) : '0';

  const totalPercentageSum = students.reduce((acc, s) => acc + s.percentage, 0);
  const avgPercentage = totalStudents > 0 ? (totalPercentageSum / totalStudents).toFixed(1) : '0';

  const totalAttendanceSum = students.reduce((acc, s) => acc + s.attendance.percentage, 0);
  const avgAttendance = totalStudents > 0 ? (totalAttendanceSum / totalStudents).toFixed(1) : '0';

  const atRiskStudents = students.filter(
    s => s.attendance.percentage < 75 || s.status === 'Failed'
  );

  // Department-wise stats for Bar Chart
  const departmentStatsMap: Record<string, { totalPct: number; totalAtt: number; count: number }> = {};
  students.forEach(s => {
    const deptShort = s.department.replace('Engineering', 'Eng.').replace('Computer Science & Eng.', 'CSE').replace('Electronics & Communication', 'ECE').replace('Information Technology', 'IT').replace('Mechanical Eng.', 'Mech').replace('Civil Eng.', 'Civil');
    if (!departmentStatsMap[deptShort]) {
      departmentStatsMap[deptShort] = { totalPct: 0, totalAtt: 0, count: 0 };
    }
    departmentStatsMap[deptShort].totalPct += s.percentage;
    departmentStatsMap[deptShort].totalAtt += s.attendance.percentage;
    departmentStatsMap[deptShort].count += 1;
  });

  const departmentChartData = Object.entries(departmentStatsMap).map(([dept, data]) => ({
    department: dept,
    avgScore: Number((data.totalPct / data.count).toFixed(1)),
    avgAttendance: Number((data.totalAtt / data.count).toFixed(1)),
  }));

  // Grade Distribution for Pie Chart
  const gradeCounts: Record<string, number> = { O: 0, 'A+': 0, A: 0, 'B+': 0, B: 0, C: 0, F: 0 };
  students.forEach(s => {
    if (gradeCounts[s.grade] !== undefined) {
      gradeCounts[s.grade]++;
    }
  });

  const gradeChartData = Object.entries(gradeCounts)
    .filter(([_, count]) => count > 0)
    .map(([grade, count]) => ({
      name: `Grade ${grade}`,
      value: count,
    }));

  const GRADE_COLORS: Record<string, string> = {
    'Grade O': '#10b981', // emerald
    'Grade A+': '#0d9488', // teal
    'Grade A': '#3b82f6', // blue
    'Grade B+': '#6366f1', // indigo
    'Grade B': '#f59e0b', // amber
    'Grade C': '#f97316', // orange
    'Grade F': '#ef4444', // red
  };

  // Top 5 Rankers (Sorted by GPA desc, then percentage desc)
  const topRankers = [...students]
    .filter(s => s.status === 'Passed')
    .sort((a, b) => b.gpa - a.gpa || b.percentage - a.percentage)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-semibold uppercase tracking-wider mb-2">
            Academic Performance Cockpit
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Institutional Performance Dashboard
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Real-time analytics for student academic records, continuous assessment marks, attendance compliance, and grade evaluations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-white text-blue-800 font-semibold text-sm hover:bg-blue-50 shadow-xs transition-colors flex items-center gap-2"
          >
            <span>+ Enroll Student</span>
          </button>
          <button
            onClick={() => setActiveSection('reports')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors flex items-center gap-2 border border-white/20"
          >
            <span>Generate Reports</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          id="stat-total-students"
          title="Total Students"
          value={totalStudents}
          subtitle="Enrolled in active semester"
          icon={Users}
          colorTheme="blue"
        />
        <StatCard
          id="stat-pass-rate"
          title="Pass Percentage"
          value={`${passRate}%`}
          subtitle={`${passedStudents} of ${totalStudents} cleared all`}
          icon={CheckCircle2}
          colorTheme="emerald"
        />
        <StatCard
          id="stat-avg-score"
          title="Class Average"
          value={`${avgPercentage}%`}
          subtitle="Overall marks index"
          icon={Percent}
          colorTheme="purple"
        />
        <StatCard
          id="stat-avg-attendance"
          title="Avg Attendance"
          value={`${avgAttendance}%`}
          subtitle="Institutional attendance"
          icon={CalendarCheck}
          colorTheme="blue"
        />
        <StatCard
          id="stat-at-risk"
          title="Attention Needed"
          value={atRiskStudents.length}
          subtitle="Arrears or attendance < 75%"
          icon={AlertTriangle}
          colorTheme={atRiskStudents.length > 0 ? 'amber' : 'emerald'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Comparison Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Department Performance Benchmark</h2>
              <p className="text-xs text-slate-500">Average marks score vs average attendance by department</p>
            </div>
            <button
              onClick={() => setActiveSection('performance')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Deep Analysis</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: 'none',
                  }}
                  formatter={(val: any) => [`${val}%`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="avgScore" name="Avg Marks %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgAttendance" name="Avg Attendance %" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution Donut/Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">Grade Breakdown</h2>
              <p className="text-xs text-slate-500">Distribution across all batches</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {totalStudents} Evaluated
            </span>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {gradeChartData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={GRADE_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Quick grade tags */}
          <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100 text-center text-xs">
            {Object.entries(gradeCounts).slice(0, 4).map(([gr, cnt]) => (
              <div key={gr} className="p-1 rounded bg-slate-50">
                <span className="font-bold text-slate-800">{gr}: </span>
                <span className="text-slate-600">{cnt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Section: Top Rankers & At-Risk / Attention Required */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Academic Toppers</h2>
                <p className="text-xs text-slate-500">Highest GPA achievers this semester</p>
              </div>
            </div>
            <button
              onClick={() => setActiveSection('students')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {topRankers.map((student, idx) => (
              <div
                key={student.id}
                onClick={() => setSelectedStudentForDetail(student)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : idx === 1
                        ? 'bg-slate-200 text-slate-800'
                        : idx === 2
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{student.name}</h3>
                    <p className="text-xs text-slate-500">{student.registerNumber} • {student.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{student.percentage}%</div>
                    <div className="text-[11px] text-slate-500">GPA: {student.gpa}</div>
                  </div>
                  <GradeBadge grade={student.grade} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attention Required Card (Attendance Shortage or Arrears) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Academic & Attendance Alerts</h2>
                <p className="text-xs text-slate-500">Students needing remediation or condonation</p>
              </div>
            </div>
            <button
              onClick={() => setActiveSection('attendance')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <span>Attendance Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {atRiskStudents.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All students meet the 75% attendance and academic pass criteria!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {atRiskStudents.slice(0, 5).map(student => {
                const attColor = getAttendanceColor(student.attendance.percentage);
                return (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudentForDetail(student)}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{student.name}</h3>
                      <p className="text-xs text-slate-500">
                        {student.registerNumber} • {student.department}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {student.status === 'Failed' && (
                        <span className="text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                          {student.failedSubjectsCount} Arrear(s)
                        </span>
                      )}
                      <div className="text-right">
                        <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${attColor.badge}`}>
                          {student.attendance.percentage}% Att.
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
