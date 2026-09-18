import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, NavigationSection, SubjectMark } from '../types';
import { INITIAL_STUDENTS } from '../data/sampleData';
import { calculateStudentMetrics } from '../utils/calculations';

interface StudentContextType {
  students: Student[];
  activeSection: NavigationSection;
  setActiveSection: (section: NavigationSection) => void;
  selectedStudentForDetail: Student | null;
  setSelectedStudentForDetail: (student: Student | null) => void;
  addStudent: (student: Omit<Student, 'id' | 'totalMarks' | 'maxTotalMarks' | 'percentage' | 'grade' | 'gpa' | 'status' | 'failedSubjectsCount' | 'remarks'>) => void;
  updateStudent: (id: string, updatedData: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  updateSubjectMark: (studentId: string, subjectCode: string, newMark: number) => void;
  updateStudentAttendance: (studentId: string, attended: number, total?: number) => void;
  markBatchAttendance: (studentIds: string[], attended: boolean) => void;
  resetToDemoData: () => void;
  exportJSON: () => void;
  importJSON: (jsonString: string) => boolean;
}

const STORAGE_KEY = 'spms_students_data_v1';

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse stored student data', e);
    }
    return INITIAL_STUDENTS;
  });

  const [activeSection, setActiveSection] = useState<NavigationSection>('dashboard');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save students to localStorage', e);
    }
  }, [students]);

  // Keep selectedStudentForDetail in sync with updated data
  useEffect(() => {
    if (selectedStudentForDetail) {
      const fresh = students.find(s => s.id === selectedStudentForDetail.id);
      if (fresh && fresh !== selectedStudentForDetail) {
        setSelectedStudentForDetail(fresh);
      }
    }
  }, [students, selectedStudentForDetail]);

  const addStudent = (studentData: Omit<Student, 'id' | 'totalMarks' | 'maxTotalMarks' | 'percentage' | 'grade' | 'gpa' | 'status' | 'failedSubjectsCount' | 'remarks'>) => {
    const newId = `stu-${Date.now().toString().slice(-6)}`;
    const metrics = calculateStudentMetrics(studentData.subjects, studentData.attendance);

    const newStudent: Student = {
      ...studentData,
      id: newId,
      totalMarks: metrics.totalMarks,
      maxTotalMarks: metrics.maxTotalMarks,
      percentage: metrics.percentage,
      grade: metrics.grade,
      gpa: metrics.gpa,
      status: metrics.status,
      failedSubjectsCount: metrics.failedSubjectsCount,
      remarks: metrics.remarks,
      attendance: {
        ...studentData.attendance,
        percentage: metrics.attendancePercentage,
        lastUpdated: new Date().toISOString().split('T')[0],
      },
    };

    setStudents(prev => [newStudent, ...prev]);
  };

  const updateStudent = (id: string, updatedData: Partial<Student>) => {
    setStudents(prev =>
      prev.map(student => {
        if (student.id !== id) return student;

        const mergedSubjects = updatedData.subjects || student.subjects;
        const mergedAttendance = updatedData.attendance || student.attendance;
        const metrics = calculateStudentMetrics(mergedSubjects, mergedAttendance);

        return {
          ...student,
          ...updatedData,
          subjects: mergedSubjects,
          attendance: {
            ...mergedAttendance,
            percentage: metrics.attendancePercentage,
            lastUpdated: new Date().toISOString().split('T')[0],
          },
          totalMarks: metrics.totalMarks,
          maxTotalMarks: metrics.maxTotalMarks,
          percentage: metrics.percentage,
          grade: metrics.grade,
          gpa: metrics.gpa,
          status: metrics.status,
          failedSubjectsCount: metrics.failedSubjectsCount,
          remarks: metrics.remarks,
        };
      })
    );
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    if (selectedStudentForDetail?.id === id) {
      setSelectedStudentForDetail(null);
    }
  };

  const updateSubjectMark = (studentId: string, subjectCode: string, newMark: number) => {
    setStudents(prev =>
      prev.map(student => {
        if (student.id !== studentId) return student;
        const updatedSubjects = student.subjects.map(sub => {
          if (sub.code === subjectCode) {
            const clamped = Math.max(0, Math.min(sub.maxMarks || 100, newMark));
            return { ...sub, marks: clamped };
          }
          return sub;
        });

        const metrics = calculateStudentMetrics(updatedSubjects, student.attendance);

        return {
          ...student,
          subjects: updatedSubjects,
          totalMarks: metrics.totalMarks,
          maxTotalMarks: metrics.maxTotalMarks,
          percentage: metrics.percentage,
          grade: metrics.grade,
          gpa: metrics.gpa,
          status: metrics.status,
          failedSubjectsCount: metrics.failedSubjectsCount,
          remarks: metrics.remarks,
        };
      })
    );
  };

  const updateStudentAttendance = (studentId: string, attended: number, total?: number) => {
    setStudents(prev =>
      prev.map(student => {
        if (student.id !== studentId) return student;
        const newTotal = total !== undefined ? total : student.attendance.totalClasses;
        const validTotal = Math.max(1, newTotal);
        const validAttended = Math.max(0, Math.min(validTotal, attended));

        const updatedAttendance = {
          totalClasses: validTotal,
          attendedClasses: validAttended,
          percentage: Number(((validAttended / validTotal) * 100).toFixed(1)),
          lastUpdated: new Date().toISOString().split('T')[0],
        };

        const metrics = calculateStudentMetrics(student.subjects, updatedAttendance);

        return {
          ...student,
          attendance: updatedAttendance,
          remarks: metrics.remarks,
        };
      })
    );
  };

  const markBatchAttendance = (studentIds: string[], attended: boolean) => {
    setStudents(prev =>
      prev.map(student => {
        if (!studentIds.includes(student.id)) return student;
        const newTotal = student.attendance.totalClasses + 1;
        const newAttended = attended
          ? student.attendance.attendedClasses + 1
          : student.attendance.attendedClasses;

        const updatedAttendance = {
          totalClasses: newTotal,
          attendedClasses: newAttended,
          percentage: Number(((newAttended / newTotal) * 100).toFixed(1)),
          lastUpdated: new Date().toISOString().split('T')[0],
        };

        const metrics = calculateStudentMetrics(student.subjects, updatedAttendance);

        return {
          ...student,
          attendance: updatedAttendance,
          remarks: metrics.remarks,
        };
      })
    );
  };

  const resetToDemoData = () => {
    setStudents(INITIAL_STUDENTS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS));
    } catch (e) {
      console.error(e);
    }
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(students, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `spms_students_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Validate items
        const sanitized = parsed.map((item, idx) => {
          const subjects = Array.isArray(item.subjects) ? item.subjects : [];
          const attendance = item.attendance || { totalClasses: 50, attendedClasses: 40 };
          const metrics = calculateStudentMetrics(subjects, attendance);
          return {
            ...item,
            id: item.id || `stu-imp-${idx}-${Date.now()}`,
            subjects,
            attendance: {
              ...attendance,
              percentage: metrics.attendancePercentage,
              lastUpdated: new Date().toISOString().split('T')[0],
            },
            totalMarks: metrics.totalMarks,
            maxTotalMarks: metrics.maxTotalMarks,
            percentage: metrics.percentage,
            grade: metrics.grade,
            gpa: metrics.gpa,
            status: metrics.status,
            failedSubjectsCount: metrics.failedSubjectsCount,
            remarks: metrics.remarks,
          };
        });
        setStudents(sanitized);
        return true;
      }
    } catch (e) {
      console.error('Import failed', e);
    }
    return false;
  };

  return (
    <StudentContext.Provider
      value={{
        students,
        activeSection,
        setActiveSection,
        selectedStudentForDetail,
        setSelectedStudentForDetail,
        addStudent,
        updateStudent,
        deleteStudent,
        updateSubjectMark,
        updateStudentAttendance,
        markBatchAttendance,
        resetToDemoData,
        exportJSON,
        importJSON,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudents = (): StudentContextType => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudents must be used within a StudentProvider');
  }
  return context;
};
