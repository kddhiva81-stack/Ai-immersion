import React, { useState } from 'react';
import { StudentProvider, useStudents } from './context/StudentContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { StudentsView } from './components/students/StudentsView';
import { MarksView } from './components/marks/MarksView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { PerformanceView } from './components/performance/PerformanceView';
import { ReportsView } from './components/reports/ReportsView';
import { StudentModal } from './components/students/StudentModal';
import { StudentDetailModal } from './components/students/StudentDetailModal';
import { Student } from './types';

const MainLayout: React.FC = () => {
  const { 
    activeSection, 
    addStudent, 
    updateStudent, 
    selectedStudentForDetail, 
    setSelectedStudentForDetail 
  } = useStudents();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleOpenAddModal = () => {
    setStudentToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setStudentToEdit(student);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setStudentToEdit(null);
  };

  const handleSaveStudent = (data: any) => {
    if (studentToEdit) {
      updateStudent(studentToEdit.id, data);
    } else {
      addStudent(data);
    }
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation */}
      <Navbar
        onOpenAddModal={handleOpenAddModal}
        isMobileNavOpen={isMobileNavOpen}
        setIsMobileNavOpen={setIsMobileNavOpen}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          isMobileNavOpen={isMobileNavOpen}
          setIsMobileNavOpen={setIsMobileNavOpen}
        />

        {/* Content View Container */}
        <main className="flex-1 min-w-0 lg:pl-64 transition-all">
          <div className="p-4 sm:p-6 lg:p-8">
            {activeSection === 'dashboard' && (
              <DashboardView onOpenAddModal={handleOpenAddModal} />
            )}
            {activeSection === 'students' && (
              <StudentsView
                onOpenAddModal={handleOpenAddModal}
                onOpenEditModal={handleOpenEditModal}
              />
            )}
            {activeSection === 'marks' && <MarksView />}
            {activeSection === 'attendance' && <AttendanceView />}
            {activeSection === 'performance' && <PerformanceView />}
            {activeSection === 'reports' && <ReportsView />}
          </div>
        </main>
      </div>

      {/* Add / Edit Student Modal */}
      <StudentModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveStudent}
        studentToEdit={studentToEdit}
      />

      {/* Full Student Profile & Transcript Modal */}
      <StudentDetailModal
        student={selectedStudentForDetail}
        onClose={() => setSelectedStudentForDetail(null)}
        onEdit={handleOpenEditModal}
      />
    </div>
  );
};

export default function App() {
  return (
    <StudentProvider>
      <MainLayout />
    </StudentProvider>
  );
}
