import React, { useState, useEffect } from 'react';
import AdminDashboardHeaderSection from './AdminDashboardHeaderSection';
import { StudentStatusSection } from './StudentStatusSection';
import { VerifyStudentModal } from './VerifyStudentModal';
import { EditCoursesModal } from './EditCoursesModal';
import { EditStudentProfileModal } from './EditStudentProfileModal';

export const AdminDashboard = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [students, setStudents] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  // 🚨 RESTORED: Setup Lock Controller State 🚨
  const [isSetupLocked, setIsSetupLocked] = useState(() => {
    return localStorage.getItem('setupLocked') === 'true';
  });

  const [editingProfileStudent, setEditingProfileStudent] = useState(null);

  // We need to pull fetchInitialData OUT of the useEffect so we can call it manually
  // Put this function right above your useEffects:
  // We need to pull fetchInitialData OUT of the useEffect so we can call it manually
  // Put this function right above your useEffects:
  const refreshStudents = async () => {
    try {
      const studentsRes = await fetch('http://localhost:5000/api/students');
      const studentsData = await studentsRes.json();
      
      // 🚨 THE FIX: Removed the frontend .filter() because the backend already did it!
      const formattedStudents = studentsData.map(student => ({
        id: student.id,
        studentId: student.school_id || "N/A", 
        firstName: student.first_name || "",
        lastName: student.last_name || "",
        name: student.name || `${student.first_name || ""} ${student.last_name || ""}`.trim(),
        email: student.email || "No Email", 
        yearLevel: student.year_standing || student.yearLevel || 1,
        courses: [] 
      }));
      setStudents(formattedStudents);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  // 1. FETCH ALL COURSES & ALL STUDENTS ON LOAD
  // 1. FETCH ALL COURSES & ALL STUDENTS ON LOAD
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const studentsRes = await fetch('http://localhost:5000/api/students');
        const studentsData = await studentsRes.json();

        // 🚨 THE FIX: Removed the frontend .filter() here too!
        const formattedStudents = studentsData.map(student => ({
          id: student.id,
          studentId: student.school_id || "N/A", 
          firstName: student.first_name || "", 
          lastName: student.last_name || "",   
          name: student.name || `${student.first_name || ""} ${student.last_name || ""}`.trim(),
          email: student.email || "No Email", 
          yearLevel: student.year_standing || student.yearLevel || 1,
          courses: [] 
        }));

        setStudents(formattedStudents);
      } catch (error) {
        console.error("Error fetching data from database:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Modal Controllers
  const [verifyStudent, setVerifyStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);

  // 2. FETCH SPECIFIC STUDENT RECORDS ON "EDIT" CLICK
  const handleOpenEdit = async (student) => {
    try {
      const response = await fetch(`http://localhost:5000/api/student-records/${student.id}`);
      const records = await response.json();
      
      const studentWithRecords = {
        ...student,
        courses: records.map(r => ({
          courseId: r.course_id || r.id,
          status: r.status
        }))
      };
      
      setEditStudent(studentWithRecords);
    } catch (error) {
      console.error("Failed to load student records for editing:", error);
      alert("Could not load student records.");
    }
  };

  // 3. FETCH SPECIFIC STUDENT RECORDS ON "VERIFY" CLICK
  const handleOpenVerify = async (student) => {
    try {
      const response = await fetch(`http://localhost:5000/api/student-records/${student.id}`);
      const records = await response.json();
      
      const studentWithRecords = {
        ...student,
        courses: records.map(r => ({
          courseId: r.course_id || r.id,
          code: r.code,
          title: r.title,
          status: r.status,
          grade: r.grade ? Number(r.grade) : null,
          isPetitioned: r.is_petitioned || false // 🚨 INTEGRATED FIX: Safely grab the petition flag
        }))
      };
      
      setVerifyStudent(studentWithRecords);
    } catch (error) {
      console.error("Failed to load student records for verification:", error);
      alert("Could not load student records.");
    }
  };

  // 4. ARCHIVE A STUDENT
  const handleArchiveStudent = async (studentToArchive) => {
    const confirmArchive = window.confirm(`Are you sure you want to archive ${studentToArchive.name}? They will be hidden from the main dashboard, but their records will remain safely stored in the database.`);
    
    if (!confirmArchive) return;

    try {
      const response = await fetch(`http://localhost:5000/api/students/${studentToArchive.id}`, {
        method: 'DELETE', 
      });

      if (response.ok) {
        setStudents(prevStudents => prevStudents.filter(s => s.id !== studentToArchive.id));
        alert(`${studentToArchive.name} has been archived successfully.`);
      } else {
        alert("Failed to archive student.");
      }
    } catch (error) {
      console.error("Error archiving student:", error);
      alert("Something went wrong connecting to the database.");
    }
  };

  // 🚨 RESTORED: Toggle Setup Lock Handler 🚨
  const handleToggleSetupLock = () => {
    const newState = !isSetupLocked;
    setIsSetupLocked(newState);
    localStorage.setItem('setupLocked', newState.toString());
  };

  return (
    <main className="flex flex-col w-full min-h-screen bg-[#F4F7FA] font-sans pb-24 relative">
      <AdminDashboardHeaderSection />

      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-[58px] mt-10 flex flex-col gap-10">
        
        {/* 🚨 RESTORED: UI Header with the Toggle Switch 🚨 */}
        <section className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-black/5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="text-[#003366] text-[32px] lg:text-[40px] font-bold font-['Calistoga'] leading-tight m-0">
                Admin Portal
              </h2>
              <span className="text-3xl animate-bounce">👋</span>
            </div>
            <p className="text-[#003366]/70 text-[16px] lg:text-[18px] italic font-['Calistoga'] m-0">
              Manage student statuses, verify prerequisites, and update academic records.
            </p>
          </div>

          {/* The Toggle Switch UI */}
          <div className="flex items-center gap-4 bg-[#F4F7FA] px-5 py-4 rounded-xl border border-gray-200 shadow-inner">
            <div className="flex flex-col items-end">
              <span className="text-[#003366] font-bold font-['Inter'] text-sm uppercase tracking-wider">
                Academic Setup
              </span>
              <span className={`text-xs font-bold font-['Inter'] mt-0.5 ${isSetupLocked ? 'text-red-500' : 'text-[#10B981]'}`}>
                {isSetupLocked ? '🔒 Currently Locked' : '🔓 Open to Students'}
              </span>
            </div>
            
            <button 
              onClick={handleToggleSetupLock}
              className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isSetupLocked ? 'bg-red-500' : 'bg-[#10B981]'
              }`}
              role="switch"
              aria-checked={isSetupLocked}
            >
              <span className="sr-only">Toggle Setup Lock</span>
              <span 
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isSetupLocked ? 'translate-x-6' : 'translate-x-0'
                }`} 
              />
            </button>
          </div>
        </section>

        {isLoading ? (
          <div className="w-full bg-white rounded-3xl border border-black/10 p-10 text-center shadow-sm">
            <p className="text-gray-500 font-medium font-['Inter'] animate-pulse">Loading students from database...</p>
          </div>
        ) : (
          <StudentStatusSection 
            students={students} 
            onVerify={handleOpenVerify} 
            onEdit={handleOpenEdit} // (This is your edit COURSES button)
            onEditProfile={setEditingProfileStudent}
            onArchive={handleArchiveStudent}
          />
        )}
      </div>

      {/* Conditionally Rendered Modals */}
      {verifyStudent && (
        <VerifyStudentModal 
          student={verifyStudent} 
          onClose={() => setVerifyStudent(null)} 
        />
      )}

      {editingProfileStudent && (
        <EditStudentProfileModal 
          student={editingProfileStudent} 
          onClose={() => setEditingProfileStudent(null)} 
          onRefresh={refreshStudents} 
        />
      )}

      {editStudent && (
        <EditCoursesModal 
          student={editStudent} 
          allCourses={allCourses} 
          onClose={() => setEditStudent(null)} 
        />
      )}
    </main>
  );
};

export default AdminDashboard;