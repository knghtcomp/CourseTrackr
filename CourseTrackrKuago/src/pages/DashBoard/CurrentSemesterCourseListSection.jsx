import React from 'react';

export const CurrentSemesterCourseListSection = ({ courses }) => {
  return (
    <div className="w-full bg-white rounded-3xl border border-black/10 p-6 lg:p-10 shadow-sm flex flex-col gap-6">
      <h3 className="text-[#003366] text-2xl lg:text-3xl font-bold font-['Calistoga'] m-0">
        Current Semester Courses
      </h3>
      
      {/* Check if 'courses' exists and has items */}
      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            
            <div 
              key={index} 
              className={`min-h-[100px] rounded-2xl border p-4 flex flex-col justify-between transition-all gap-2 ${
                course.isPetitioned 
                  ? 'bg-purple-50/50 border-purple-200 hover:bg-purple-50 hover:shadow-md' 
                  : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-md hover:border-gray-300'
              }`}
            >
              {/* Top Row: Course Code and Status Badge */}
              <div className="flex justify-between items-start gap-2">
                <span className={`font-bold font-['Calistoga'] text-xl lg:text-2xl leading-none ${course.isPetitioned ? 'text-purple-900' : 'text-[#003366]'}`}>
                  {course.code}
                </span>
                
                {/* 🚨 THE FIX: Wrapper to hold multiple badges side-by-side */}
                <div className="flex flex-wrap items-center justify-end gap-2">
                  
                  {/* Petition Badge (Only shows if isPetitioned is true) */}
                  {course.isPetitioned && (
                    <span className="bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1 rounded-lg font-bold font-['Inter'] text-xs uppercase tracking-wider shrink-0">
                      ★ Petitioned
                    </span>
                  )}

                  {/* Standard Status Badge */}
                  <span className="bg-[#F59E0B]/10 text-[#F59E0B] px-3 py-1 rounded-lg font-bold font-['Inter'] text-xs uppercase tracking-wider shrink-0">
                    {course.status === 'ongoing' ? 'Enrolled' : course.status}
                  </span>
                </div>
              </div>
              
              {/* Bottom Row: Course Name and Units */}
              <div className="mt-auto flex flex-col gap-1 mt-2">
                <span className={`font-medium font-['Inter'] text-sm lg:text-base leading-tight line-clamp-2 ${course.isPetitioned ? 'text-purple-800' : 'text-gray-700'}`}>
                  {course.name}
                </span>
                <span className={`font-bold font-['Inter'] text-xs lg:text-sm ${course.isPetitioned ? 'text-purple-600' : 'text-gray-500'}`}>
                  {course.units} Units
                </span>
              </div>
            </div>
            
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium font-['Inter'] text-lg">
            No enrolled courses found for this semester.
          </p>
        </div>
      )}
    </div>
  );
};

export default CurrentSemesterCourseListSection;