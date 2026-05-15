import React from 'react';

export const CurrentSemesterCourseListSection = ({ courses }) => {
  return (
    <div className="w-full bg-white rounded-3xl border border-black/10 p-6 lg:p-10 shadow-sm flex flex-col gap-6">
      <h3 className="text-[#003366] text-2xl lg:text-3xl font-bold font-['Calistoga'] m-0">
        Current Semester Courses
      </h3>
      
      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => {
            
            // 🚨 THE FIX: Safely grab the petition flag whether it has an underscore or a capital P!
            const isCoursePetitioned = course.isPetitioned || course.is_petitioned;

            return (
              <div 
                key={index} 
                className={`min-h-[100px] rounded-2xl border p-4 flex flex-col justify-between transition-all gap-2 ${
                  isCoursePetitioned 
                    ? 'bg-purple-50/50 border-purple-200 hover:bg-purple-50 hover:shadow-md' 
                    : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-md hover:border-gray-300'
                }`}
              >
                {/* Top Row: Course Code and Status Badge */}
                <div className="flex justify-between items-start gap-2">
                  <span className={`font-bold font-['Calistoga'] text-xl lg:text-2xl leading-none ${isCoursePetitioned ? 'text-purple-900' : 'text-[#003366]'}`}>
                    {course.code}
                  </span>
                  
                  {/* MOBILE FIX: Removed flex-wrap to keep them side-by-side, added tight gap */}
                  <div className="flex items-center justify-end gap-1.5 md:gap-2 shrink-0">
                    
                    {/* Petition Badge - Star only on mobile, full text on desktop */}
                    {isCoursePetitioned && (
                      <span 
                        title="Petitioned Course"
                        className="flex items-center justify-center bg-purple-100 text-purple-700 border border-purple-200 w-6 h-6 md:w-auto md:h-auto md:px-3 md:py-1 rounded-full md:rounded-lg font-bold font-['Inter'] text-xs md:text-xs uppercase tracking-wider shrink-0"
                      >
                        ★<span className="hidden md:inline md:ml-1">Petitioned</span>
                      </span>
                    )}

                    {/* Standard Status Badge */}
                    <span className="bg-[#F59E0B]/10 text-[#F59E0B] px-2 md:px-3 py-1 rounded-md md:rounded-lg font-bold font-['Inter'] text-[10px] md:text-xs uppercase tracking-wider shrink-0">
                      {course.status === 'ongoing' ? 'Enrolled' : course.status}
                    </span>
                  </div>
                </div>
                
                {/* Bottom Row: Course Name and Units */}
                <div className="mt-auto flex flex-col gap-1 mt-2">
                  <span className={`font-medium font-['Inter'] text-sm lg:text-base leading-tight line-clamp-2 ${isCoursePetitioned ? 'text-purple-800' : 'text-gray-700'}`}>
                    {course.name || course.title}
                  </span>
                  <span className={`font-bold font-['Inter'] text-xs lg:text-sm ${isCoursePetitioned ? 'text-purple-600' : 'text-gray-500'}`}>
                    {course.units} Units
                  </span>
                </div>
              </div>
            );
          })}
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