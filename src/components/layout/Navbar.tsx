import React from 'react';
import { 
  GraduationCap, 
  Plus, 
  RotateCcw, 
  Menu, 
  X,
  Bell,
  School
} from 'lucide-react';
import { useStudents } from '../../context/StudentContext';

interface NavbarProps {
  onOpenAddModal: () => void;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  isMobileNavOpen,
  setIsMobileNavOpen,
}) => {
  const { students, resetToDemoData } = useStudents();

  // Low attendance warning count (<75%)
  const lowAttendanceCount = students.filter(s => s.attendance.percentage < 75).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <School className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-base leading-tight block">
                  EduGrade Pro
                </span>
                <span className="text-[11px] font-medium text-slate-500 tracking-wide block">
                  Student Performance System
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {lowAttendanceCount > 0 && (
              <div 
                title={`${lowAttendanceCount} student(s) below 75% minimum attendance`}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium"
              >
                <Bell className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>{lowAttendanceCount} Attendance Shortage</span>
              </div>
            )}

            <button
              id="reset-demo-btn"
              onClick={() => {
                if (window.confirm('Reset all student data to original demo records?')) {
                  resetToDemoData();
                }
              }}
              title="Reset to default sample student records"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5 border border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>

            <button
              id="add-student-nav-btn"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
