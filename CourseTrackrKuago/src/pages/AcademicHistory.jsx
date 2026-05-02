import React, { useState, useEffect } from 'react';
import { StudentDashboardHeaderSection } from "./dashboard/StudentDashboardHeaderSection"; 
import { curriculum } from '../data/curriculumData';

export const AcademicHistory = () => {
  const [userRecords, setUserRecords] = useState([]);

  // FETCH: Get the student's actual grades from PostgreSQL
  useEffect(() => {
    const fetchHistory = async () => {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) return;
      const currentUser = JSON.parse(currentUserStr);

      try {
        const response = await fetch(`http://localhost:5000/api/student-records/${currentUser.id}`);
        if (response.ok) {
          const databaseRecords = await response.json();
          
          // Merge dual records (status + petitioned) for the same course
          const courseMap = new Map();
          
          databaseRecords.forEach(record => {
            const id = Number(record.id || record.course_id);
            if (!courseMap.has(id)) {
              courseMap.set(id, { id, status: 'pending', isPetitioned: false });
            }
            
            const current = courseMap.get(id);
            if (record.status === 'petitioned') {
              current.isPetitioned = true;
            } else {
              current.status = record.status; // 'passed' or 'ongoing'
            }
          });

          // Save the merged data to our React state
          setUserRecords(Array.from(courseMap.values()));
        }
      } catch (error) {
        console.error("Failed to load academic history:", error);
      }
    };

    fetchHistory();
  }, []);

  // 🚨 UI FIX: Scaled badges down to text-xs and reduced padding for a tighter fit
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
      <div className="flex flex-wrap items-center gap-1.5">
        {baseBadge}
        {isPetitioned && (
          <span className="px-2.5 py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded-md text-xs font-bold tracking-wide uppercase shrink-0">
            ★ Petition
          </span>
        )}
      </div>
    );
  };

  return (
    <main className="flex flex-col w-full min-h-screen bg-[#F4F7FA] font-sans pb-16">
      
      <StudentDashboardHeaderSection />
      
      {/* 🚨 UI FIX: Reduced top margin and gap */}
      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-[58px] mt-8 flex flex-col gap-6">
        
        <div className="w-full flex flex-col gap-1">
          <div className="flex items-center gap-3">
            {/* 🚨 UI FIX: Smaller, cleaner header font */}
            <h1 className="text-[#003366] text-2xl lg:text-3xl font-bold font-['Calistoga'] leading-tight m-0">
              Academic History
            </h1>
            <span className="text-2xl animate-bounce">📚</span>
          </div>
          <p className="text-[#003366]/70 text-sm lg:text-base font-medium font-['Inter'] m-0">
            Review your past courses, grades, and completed units.
          </p>
        </div>

        {/* 🚨 UI FIX: Reduced gap between semester cards */}
        <div className="flex flex-col gap-6">
          {curriculum.map((term, index) => (
            /* 🚨 UI FIX: Reduced card padding (p-5 lg:p-6) and rounded corners (rounded-2xl) */
            <div key={index} className="w-full bg-white rounded-2xl border border-black/10 p-5 lg:p-6 shadow-sm overflow-hidden flex flex-col gap-4">
              
              {/* 🚨 UI FIX: Smaller semester title font */}
              <h2 className="text-[#003366] text-xl font-bold font-['Calistoga'] border-b-2 border-gray-100 pb-3">
                {term.semester}
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b-2 border-[#003366]/20">
                      {/* 🚨 UI FIX: Reduced header vertical padding (py-2 instead of py-3) and scaled font to text-xs lg:text-sm */}
                      <th className="py-2 px-4 text-[#003366] font-bold font-['Inter'] uppercase tracking-wider text-xs lg:text-sm w-[20%]">Course Code</th>
                      <th className="py-2 px-4 text-[#003366] font-bold font-['Inter'] uppercase tracking-wider text-xs lg:text-sm w-[45%]">Descriptive Title</th>
                      <th className="py-2 px-4 text-[#003366] font-bold font-['Inter'] uppercase tracking-wider text-xs lg:text-sm w-[15%]">Units</th>
                      <th className="py-2 px-4 text-[#003366] font-bold font-['Inter'] uppercase tracking-wider text-xs lg:text-sm w-[20%]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {term.courses.map((course, idx) => {
                      
                      // Look for this exact course in the merged user records
                      const savedRecord = userRecords.find(record => record.id === course.id);
                      
                      const currentStatus = savedRecord && savedRecord.status !== 'pending' ? savedRecord.status : "pending";
                      const isPetitioned = savedRecord ? savedRecord.isPetitioned : false;

                      return (
                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          {/* 🚨 UI FIX: Shrunk vertical row padding (py-2.5) and text size (text-sm lg:text-base) */}
                          <td className="py-2.5 px-4 text-black font-bold font-['Inter'] text-sm lg:text-base whitespace-nowrap">
                            {course.code}
                          </td>
                          <td className="py-2.5 px-4 text-black/80 font-medium font-['Inter'] text-sm lg:text-base">
                            {course.title}
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
          ))}
        </div>

      </div>
    </main>
  );
};

export default AcademicHistory;