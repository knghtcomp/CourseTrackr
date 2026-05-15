import React, { useState, useEffect } from 'react';
import { StudentDashboardHeaderSection } from "./DashBoard/StudentDashboardHeaderSection"; 
import { curriculum } from '../data/curriculumData';

export const AcademicHistory = () => {
  const [userRecords, setUserRecords] = useState([]);
  
  // New States for the Toggles
  const [activeYear, setActiveYear] = useState('1st Year');
  const [activeSemester, setActiveSemester] = useState('1st Semester');

  // FETCH: Get the student's actual grades from PostgreSQL
  useEffect(() => {
    const fetchHistory = async () => {
      const currentUserStr = localStorage.getItem('studentUser');
      if (!currentUserStr) return;
      const currentUser = JSON.parse(currentUserStr);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/student-records/${currentUser.id}`);
        if (response.ok) {
          const databaseRecords = await response.json();
          
          const courseMap = new Map();
          
          databaseRecords.forEach(record => {
            const id = Number(record.id || record.course_id);
            if (!courseMap.has(id)) {
              courseMap.set(id, { id, status: 'pending', isPetitioned: false });
            }
            
            const current = courseMap.get(id);
            current.status = record.status; 
            current.isPetitioned = record.is_petitioned === true;
          });

          setUserRecords(Array.from(courseMap.values()));
        }
      } catch (error) {
        console.error("Failed to load academic history:", error);
      }
    };

    fetchHistory();
  }, []);

  // UI: Badges for Course Status
  const renderBadges = (status, isPetitioned) => {
    let baseBadge;
    
    switch (status) {
      case "passed": 
        baseBadge = <span className="px-2.5 py-1 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-md text-xs font-bold tracking-wide uppercase shrink-0">Completed</span>;
        break;
      case "ongoing": 
        baseBadge = <span className="px-2.5 py-1 bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 rounded-md text-xs font-bold tracking-wide uppercase shrink-0">Enrolled</span>;
        break;
      case "failed": 
        baseBadge = <span className="px-2.5 py-1 bg-red-100 text-red-600 border border-red-200 rounded-md text-xs font-bold tracking-wide uppercase shrink-0">Failed</span>;
        break;
      case "INC": 
        baseBadge = <span className="px-2.5 py-1 bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 rounded-md text-xs font-bold tracking-wide uppercase shrink-0">INC</span>;
        break;
      default: 
        baseBadge = <span className="px-2.5 py-1 bg-gray-100 text-gray-500 border border-gray-200 rounded-md text-xs font-bold tracking-wide uppercase shrink-0">Pending</span>;
    }

    return (
      <div className="flex items-center flex-nowrap whitespace-nowrap gap-2">
        {baseBadge}
        {isPetitioned && (
          <span 
            title="Petitioned Course"
            className="w-5 h-5 flex items-center justify-center bg-purple-100 text-purple-700 border border-purple-200 rounded-full text-[10px] font-bold shrink-0"
          >
            ★
          </span>
        )}
      </div>
    );
  };

  // 🚨 DYNAMIC TOGGLE LOGIC
  const handleYearChange = (year) => {
    setActiveYear(year);
    setActiveSemester('1st Semester'); // Reset to 1st sem when switching years
  };

  // 1. Filter curriculum down to just the active year
  const termsInActiveYear = curriculum.filter(t => t.semester.includes(activeYear));
  
  // 2. Check if this specific year has a Summer term in the database
  const hasSummer = termsInActiveYear.some(t => t.semester.includes('Summer'));
  
  // 3. Build the semester options array
  const availableSemesters = ['1st Semester', '2nd Semester'];
  if (hasSummer) availableSemesters.push('Summer');

  // 4. Find the exact term to display right now
  const displayedTerm = termsInActiveYear.find(t => t.semester.includes(activeSemester));

  return (
    <main className="flex flex-col w-full min-h-screen bg-[#F4F7FA] font-sans pb-16">
      <StudentDashboardHeaderSection />
      
      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-[58px] mt-10 flex flex-col gap-10">
        
        {/* PAGE TITLE */}
        <div className="w-full flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-[#003366] text-[32px] lg:text-[40px] font-bold font-['Calistoga'] leading-tight m-0">
              Academic History
            </h1>
            <span className="text-3xl animate-bounce">📚</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mt-1">
            <p className="text-[#003366]/70 text-[16px] lg:text-[18px] italic font-['Calistoga'] m-0">
              Review your past courses, requirements, and completed units.
            </p>
          </div>
        </div>

        {/* TOGGLES SECTION */}
        {/* Changed flex-col-reverse to flex-col so Years stay on top on mobile */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full">
          
          {/* YEAR TOGGLE */}
          {/* Added grid-cols-2 for mobile to force 2x2 layout, turns back to flex row on desktop (lg:flex) */}
          <div className="grid grid-cols-2 lg:flex lg:flex-nowrap bg-[#E9EBEF] rounded-3xl lg:rounded-full p-1 w-full lg:w-fit gap-1 lg:gap-0">
            {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((year) => (
              <button
                key={year}
                onClick={() => handleYearChange(year)}
                className={`w-full px-2 lg:px-6 py-2 text-sm lg:text-base font-bold rounded-full transition-all whitespace-nowrap ${
                  activeYear === year ? 'bg-[#003366] text-white shadow-md' : 'text-[#003366] hover:bg-black/5'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
          
          {/* SEMESTER TOGGLE */}
          <div className="flex bg-[#E9EBEF] rounded-full p-1 w-full lg:w-fit">
            {availableSemesters.map((sem) => (
              <button
                key={sem}
                onClick={() => setActiveSemester(sem)}
                className={`flex-1 px-3 lg:px-6 py-2 text-xs lg:text-base font-bold rounded-full transition-all whitespace-nowrap ${
                  activeSemester === sem ? 'bg-[#003366] text-white shadow-md' : 'text-[#003366] hover:bg-black/5'
                }`}
              >
                {sem}
              </button>
            ))}
          </div>

        </div>

        {/* TABLE SECTION */}
          <div className="flex flex-col gap-2">
            {displayedTerm ? (
              <div className="w-full bg-white rounded-2xl border border-black/10 p-5 lg:p-6 shadow-sm overflow-hidden flex flex-col gap-4">
                <h2 className="text-[#003366] text-xl font-bold font-['Calistoga'] border-b-2 border-gray-100 pb-3">
                  {displayedTerm.semester}
                </h2>

                {/* MOBILE FIX: Slim Card Layout showing ONLY Title and Status */}
                <div className="block lg:hidden">
                  <div className="flex flex-col gap-3">
                    {displayedTerm.courses.map((course, idx) => {
                      const savedRecord = userRecords.find(record => record.id === course.id);
                      const currentStatus = savedRecord && savedRecord.status !== 'pending' ? savedRecord.status : "pending";
                      const isPetitioned = savedRecord ? savedRecord.isPetitioned : false;

                      return (
                        <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between gap-4 shadow-sm">
                          <span className="text-black font-bold font-['Inter'] text-sm leading-tight">
                            {course.title}
                          </span>
                          <div className="shrink-0">
                            {renderBadges(currentStatus, isPetitioned)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Desktop Table Layout (Hidden on Mobile) */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b-2 border-[#003366]/20">
                        <th className="py-2 px-4 text-[#003366] font-bold font-['Inter'] uppercase tracking-wider text-xs lg:text-sm w-[15%]">Code</th>
                        <th className="py-2 px-4 text-[#003366] font-bold font-['Inter'] uppercase tracking-wider text-xs lg:text-sm w-[30%]">Title</th>
                        <th className="py-2 px-4 text-[#003366] font-bold font-['Inter'] uppercase tracking-wider text-xs lg:text-sm w-[15%]">Prerequisite</th>
                        <th className="py-2 px-4 text-[#003366] font-bold font-['Inter'] uppercase tracking-wider text-xs lg:text-sm w-[15%]">Corequisite</th>
                        <th className="py-2 px-4 text-[#003366] font-bold font-['Inter'] uppercase tracking-wider text-xs lg:text-sm w-[10%]">Units</th>
                        <th className="py-2 px-4 text-[#003366] font-bold font-['Inter'] uppercase tracking-wider text-xs lg:text-sm w-[15%]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedTerm.courses.map((course, idx) => {
                        const savedRecord = userRecords.find(record => record.id === course.id);
                        const currentStatus = savedRecord && savedRecord.status !== 'pending' ? savedRecord.status : "pending";
                        const isPetitioned = savedRecord ? savedRecord.isPetitioned : false;

                        return (
                          <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-2.5 px-4 text-black font-bold font-['Inter'] text-sm lg:text-base whitespace-nowrap">
                              {course.code}
                            </td>
                            <td className="py-2.5 px-4 text-black/80 font-medium font-['Inter'] text-sm lg:text-base">
                              {course.title}
                            </td>
                            <td className="py-2.5 px-4 text-gray-600 font-medium font-['Inter'] text-xs lg:text-sm italic whitespace-nowrap">
                              {course.prereq || 'None'}
                            </td>
                            <td className="py-2.5 px-4 text-gray-600 font-medium font-['Inter'] text-xs lg:text-sm italic whitespace-nowrap">
                              {course.coreq || 'None'}
                            </td>
                            <td className="py-2.5 px-4 text-[#003366] font-bold font-['Inter'] text-sm lg:text-base">
                              {course.units}
                            </td>
                            <td className="py-2.5 px-4">
                              {renderBadges(currentStatus, isPetitioned)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="w-full bg-white rounded-3xl border border-black/10 p-10 text-center shadow-sm">
                <p className="text-gray-500 font-medium font-['Inter']">
                  No curriculum data found for {activeYear} - {activeSemester}.
                </p>
              </div>
            )}
          </div>
        </div>
    </main>
  );
};

export default AcademicHistory;