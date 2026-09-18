import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2, 
  LayoutGrid, 
  Table as TableIcon,
  Download,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { Student } from '../../types';
import { useStudents } from '../../context/StudentContext';
import { DEPARTMENTS, SEMESTERS } from '../../data/sampleData';
import { GradeBadge, StatusBadge } from '../common/GradeBadge';
import { ProgressBar } from '../common/ProgressBar';
import { ConfirmModal } from '../common/ConfirmModal';
import { getAttendanceColor } from '../../utils/calculations';

interface StudentsViewProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (student: Student) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const { students, deleteStudent, setSelectedStudentForDetail } = useStudents();

  // Search & Filter states
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedSem, setSelectedSem] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'Passed' | 'Failed'
  const [attendanceFilter, setAttendanceFilter] = useState('all'); // 'all' | 'eligible' | 'warning'
  const [sortBy, setSortBy] = useState<'name' | 'registerNumber' | 'percentage' | 'attendance' | 'gpa'>('percentage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Delete modal state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Filtered and Sorted Students
  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        // Search
        const query = search.toLowerCase().trim();
        const matchesSearch = 
          !query ||
          s.name.toLowerCase().includes(query) ||
          s.registerNumber.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query);

        if (!matchesSearch) return false;

        // Department filter
        if (selectedDept !== 'all' && s.department !== selectedDept) return false;

        // Semester filter
        if (selectedSem !== 'all' && s.semester !== Number(selectedSem)) return false;

        // Status filter
        if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;

        // Attendance filter
        if (attendanceFilter === 'eligible' && s.attendance.percentage < 75) return false;
        if (attendanceFilter === 'warning' && s.attendance.percentage >= 75) return false;

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'registerNumber') {
          comparison = a.registerNumber.localeCompare(b.registerNumber);
        } else if (sortBy === 'percentage') {
          comparison = a.percentage - b.percentage;
        } else if (sortBy === 'attendance') {
          comparison = a.attendance.percentage - b.attendance.percentage;
        } else if (sortBy === 'gpa') {
          comparison = a.gpa - b.gpa;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [students, search, selectedDept, selectedSem, selectedStatus, attendanceFilter, sortBy, sortOrder]);

  const toggleSort = (field: 'name' | 'registerNumber' | 'percentage' | 'attendance' | 'gpa') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
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

    const rows = filteredStudents.map(s => [
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
    link.setAttribute('download', `students_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-5">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage student registrations, academic standing, and individual records ({filteredStudents.length} of {students.length} students)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            title="Download currently filtered students as CSV"
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            id="add-student-page-btn"
            onClick={onOpenAddModal}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="student-search-input"
              type="text"
              placeholder="Search by student name, reg no, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              id="department-filter"
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <select
              id="semester-filter"
              value={selectedSem}
              onChange={e => setSelectedSem(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Semesters</option>
              {SEMESTERS.map(sem => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Status & Attendance Filter */}
          <div>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="Passed">Passed (No Arrears)</option>
              <option value="Failed">Failed (With Arrears)</option>
            </select>
          </div>
        </div>

        {/* Secondary controls: Attendance shortage filter, Sort, and View Mode */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-500">Attendance:</span>
            <button
              onClick={() => setAttendanceFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                attendanceFilter === 'all'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setAttendanceFilter('eligible')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                attendanceFilter === 'eligible'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Eligible (≥75%)
            </button>
            <button
              onClick={() => setAttendanceFilter('warning')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                attendanceFilter === 'warning'
                  ? 'bg-rose-600 text-white font-medium'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Shortage (&lt;75%)
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white font-medium text-slate-700 text-xs"
              >
                <option value="percentage">Marks %</option>
                <option value="gpa">GPA</option>
                <option value="attendance">Attendance %</option>
                <option value="name">Name</option>
                <option value="registerNumber">Register No</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                className="p-1 rounded border border-slate-200 hover:bg-slate-100"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>

            {/* View Switch */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1 rounded ${viewMode === 'table' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-500'}`}
                title="Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1 rounded ${viewMode === 'cards' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-500'}`}
                title="Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Student Records Display */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No students found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or filter options, or enroll a new student.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedDept('all');
              setSelectedSem('all');
              setSelectedStatus('all');
              setAttendanceFilter('all');
            }}
            className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th 
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-800"
                    onClick={() => toggleSort('name')}
                  >
                    Student Details
                  </th>
                  <th className="py-3.5 px-4">Department & Sem</th>
                  <th 
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-800 text-center"
                    onClick={() => toggleSort('percentage')}
                  >
                    Performance (Marks / %)
                  </th>
                  <th 
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-800 text-center"
                    onClick={() => toggleSort('attendance')}
                  >
                    Attendance
                  </th>
                  <th className="py-3.5 px-4 text-center">Grade & GPA</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map(student => {
                  const attColor = getAttendanceColor(student.attendance.percentage);
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Name and Reg */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <button
                              onClick={() => setSelectedStudentForDetail(student)}
                              className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left block"
                            >
                              {student.name}
                            </button>
                            <span className="text-[11px] font-medium text-slate-500 block">
                              {student.registerNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Dept & Sem */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 truncate max-w-[180px]">
                          {student.department}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Semester {student.semester}
                        </div>
                      </td>

                      {/* Performance Bar */}
                      <td className="py-3.5 px-4 text-center w-48">
                        <div className="font-bold text-slate-900">
                          {student.totalMarks} / {student.maxTotalMarks}
                        </div>
                        <ProgressBar
                          value={student.percentage}
                          size="sm"
                          showLabel={false}
                          colorType="percentage"
                          className="mt-1"
                        />
                        <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                          {student.percentage}%
                        </div>
                      </td>

                      {/* Attendance */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-bold text-slate-900">
                          {student.attendance.attendedClasses} / {student.attendance.totalClasses}
                        </div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${attColor.badge}`}>
                          {student.attendance.percentage}% ({attColor.label})
                        </span>
                      </td>

                      {/* Grade & GPA */}
                      <td className="py-3.5 px-4 text-center">
                        <GradeBadge grade={student.grade} size="sm" />
                        <div className="text-[11px] font-bold text-slate-600 mt-1">
                          GPA: {student.gpa}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={student.status} size="sm" />
                        {student.failedSubjectsCount > 0 && (
                          <div className="text-[10px] font-medium text-rose-600 mt-0.5">
                            {student.failedSubjectsCount} subject failed
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="View Student Profile & Transcript"
                            onClick={() => setSelectedStudentForDetail(student)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="Edit Student Information"
                            onClick={() => onOpenEditModal(student)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete Student Record"
                            onClick={() => setStudentToDelete(student)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => {
            const attColor = getAttendanceColor(student.attendance.percentage);
            return (
              <div
                key={student.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer"
                          onClick={() => setSelectedStudentForDetail(student)}>
                          {student.name}
                        </h3>
                        <p className="text-xs text-slate-500">{student.registerNumber}</p>
                      </div>
                    </div>
                    <GradeBadge grade={student.grade} size="sm" />
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-medium text-slate-800 text-right truncate max-w-[180px]">
                        {student.department}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Semester:</span>
                      <span className="font-medium text-slate-800">Sem {student.semester}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Academic Score:</span>
                      <span className="font-bold text-slate-900">
                        {student.percentage}% ({student.totalMarks}/{student.maxTotalMarks})
                      </span>
                    </div>
                    <ProgressBar
                      value={student.percentage}
                      size="sm"
                      showLabel={false}
                      colorType="percentage"
                    />

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-500">Attendance:</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${attColor.badge}`}>
                        {student.attendance.percentage}% ({student.attendance.attendedClasses}/{student.attendance.totalClasses})
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-500">Status:</span>
                      <StatusBadge status={student.status} size="sm" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedStudentForDetail(student)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditModal(student)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setStudentToDelete(student)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(studentToDelete)}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete the academic profile and examination records for ${studentToDelete?.name} (${studentToDelete?.registerNumber})? This action cannot be undone.`}
        confirmLabel="Delete Record"
        isDestructive={true}
        onConfirm={() => {
          if (studentToDelete) {
            deleteStudent(studentToDelete.id);
            setStudentToDelete(null);
          }
        }}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
};
