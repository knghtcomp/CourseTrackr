import React from 'react';

export const ActiveCourseManagerSection = ({ courses, onUpdateStatus }) => {
  // 1. THE ADMIN LOCK
  // Checks if the admin has opened the portal. If not, this component completely disappears!
  const isGradingOpen = localStorage.getItem('gradingPortalOpen') === 'true';
  
  if (!isGradingOpen) {
    return null; // Renders absolutely nothing on the dashboard
  }

  // 2. Empty State (If portal is open, but they have no courses to update)
  if (!courses || courses.length === 0) {
    return (
      <div className="w-full bg-white rounded-3xl border border-black/10 p-10 text-center shadow-sm mt-8">
        <h3 className="text-[#003366] text-2xl font-bold font-['Calistoga'] mb-2">
          End of Semester Grading
        </h3>
        <p className="text-gray-500 font-medium font-['Inter']">
          You don't have any active courses to grade right now.
        </p>
      </div>
    );
  }

  // 3. The Active Grading List
  return (
    <div className="w-full bg-white rounded-3xl border border-black/10 p-6 lg:p-8 shadow-sm mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[#003366] text-2xl font-bold font-['Calistoga']">
          End of Semester Grading
        </h3>
        <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold font-['Inter'] rounded-md uppercase tracking-wider animate-pulse">
          Portal Open
        </span>
      </div>
      
      <div className="flex flex-col gap-4">
        {courses.map((course) => (
          <div 
            key={course.id} 
            className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200 transition-all gap-4 shadow-sm"
          >
            {/* Left Side: Course Info */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="text-black text-xl font-bold font-['Calistoga']">
                  {course.code}
                </span>
              </div>
              <span className="text-gray-600 font-normal font-['Caladea'] text-lg">
                {course.name}
              </span>
            </div>
            
            {/* Right Side: Units & Dropdown Action */}
            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
              <span className="text-gray-500 font-bold font-['Inter']">
                {course.units} Units
              </span>
              
              {/* THE DROPDOWN MENU */}
              <select 
                onChange={(e) => onUpdateStatus(course.id, e.target.value)}
                defaultValue="default"
                className="px-4 py-2.5 bg-white border-2 border-[#003366] text-[#003366] font-bold font-['Inter'] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2 cursor-pointer transition-all shadow-sm hover:bg-slate-50"
              >
                <option value="default" disabled>Select Grade...</option>
                <option value="passed">✅ Passed</option>
                <option value="failed">❌ Failed</option>
                <option value="INC">⚠️ INC (Incomplete)</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};