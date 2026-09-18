import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Award, 
  CalendarCheck, 
  BarChart3, 
  FileSpreadsheet,
  GraduationCap
} from 'lucide-react';
import { NavigationSection } from '../../types';
import { useStudents } from '../../context/StudentContext';

interface SidebarProps {
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileNavOpen,
  setIsMobileNavOpen,
}) => {
  const { activeSection, setActiveSection, students } = useStudents();

  const navItems: { id: NavigationSection; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users, badge: students.length },
    { id: 'marks', label: 'Marks', icon: Award },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'performance', label: 'Performance Analysis', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  ];

  const handleSelect = (section: NavigationSection) => {
    setActiveSection(section);
    setIsMobileNavOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileNavOpen && (
        <div
          onClick={() => setIsMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between p-4 overflow-y-auto`}
      >
        <div>
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Academic Modules
          </div>
          <nav className="space-y-1 mt-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border-l-3 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isActive
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Academic term info footer card */}
        <div className="mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Academic Year 2025-26</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Semester V Regular Examinations. System automatically enforces minimum 75% attendance rule.
          </p>
        </div>
      </aside>
    </>
  );
};
