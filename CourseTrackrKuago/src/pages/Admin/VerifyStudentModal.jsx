import React, { useMemo } from 'react';
import { curriculum } from '../../data/curriculumData';

export const VerifyStudentModal = ({ student, onClose }) => {
  
  const { displayCourses, completedCount, enrolledCount, petitionedCount } = useMemo(() => {
    const safeCourses = student.courses || [];

    return {
      displayCourses: safeCourses.filter(c => c.status === 'ongoing'),
      completedCount: safeCourses.filter(c => c.status === 'passed').length,
      enrolledCount: safeCourses.filter(c => c.status === 'ongoing').length,
      petitionedCount: safeCourses.filter(c => c.isPetitioned === true).length
    };
  }, [student.courses]);

  const getCourseDescription = (courseCode) => {
    if (!courseCode) return null;
    const normalizedCode = courseCode.toString().toUpperCase().replace(/\s+/g, '');
    const baseCode = normalizedCode.endsWith('01') ? normalizedCode.slice(0, -2) : normalizedCode;

    for (let term of curriculum) {
      const foundCourse = term.courses.find(c => {
        const currCode = c.code.toString().toUpperCase().replace(/\s+/g, '');
        return currCode === normalizedCode || currCode === baseCode;
      });
      
      if (foundCourse) {
        return foundCourse.title || foundCourse.name;
      }
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative">
        
        {/* Close Button */}
        {/* MOBILE FIX: Moved slightly to accommodate tighter header padding */}
        <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-red-500 transition-colors text-xl md:text-2xl z-20 p-1">
          ✕
        </button>

        {/* Modal Header */}
        {/* MOBILE FIX: Scaled down padding and text sizes */}
        <div className="p-4 md:p-6 lg:p-8 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white/95 backdrop-blur z-10 pr-12 md:pr-16">
          <div className="w-full">
            <h2 className="text-[#003366] text-lg md:text-xl lg:text-2xl font-bold font-['Calistoga'] m-0 leading-tight">Student Check Report</h2>
            <p className="text-gray-500 font-medium font-['Inter'] mt-0.5 md:mt-1 text-xs md:text-sm">
              {student.name} ({student.studentId || student.school_id})
            </p>
          </div>
        </div>

        {/* Modal Body */}
        {/* MOBILE FIX: Tightened the main gap from gap-8 to gap-5 */}
        <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-5 lg:gap-8">
          
          {/* Stats Row */}
          {/* MOBILE FIX: Tightened the gap between stat cards and reduced internal padding/text size */}
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <div className="bg-gray-50 rounded-xl md:rounded-2xl p-2.5 md:p-4 border border-gray-100 text-center shadow-sm">
              <div className="text-gray-500 text-[10px] md:text-sm font-semibold font-['Inter'] mb-0.5 md:mb-1 uppercase tracking-tight">Completed</div>
              <div className="text-[#003366] text-xl md:text-3xl font-bold font-['Inter']">{completedCount}</div>
            </div>
            <div className="bg-gray-50 rounded-xl md:rounded-2xl p-2.5 md:p-4 border border-gray-100 text-center shadow-sm">
              <div className="text-gray-500 text-[10px] md:text-sm font-semibold font-['Inter'] mb-0.5 md:mb-1 uppercase tracking-tight">Enrolled</div>
              <div className="text-[#F59E0B] text-xl md:text-3xl font-bold font-['Inter']">{enrolledCount}</div>
            </div>
            <div className="bg-purple-50/50 rounded-xl md:rounded-2xl p-2.5 md:p-4 border border-purple-100 text-center shadow-sm">
              <div className="text-purple-600/70 text-[10px] md:text-sm font-semibold font-['Inter'] mb-0.5 md:mb-1 uppercase tracking-tight">Petitioned</div>
              <div className="text-purple-600 text-xl md:text-3xl font-bold font-['Inter']">{petitionedCount}</div>
            </div>
          </div>

          {/* Enrolled Courses List */}
          <div>
            <h4 className="text-[#003366] text-xs md:text-sm font-bold font-['Inter'] uppercase tracking-wider mb-2 md:mb-3">
              Enrolled Courses
            </h4>
            
            <div className="flex flex-col gap-2 md:gap-3">
              {displayCourses.length > 0 ? (
                displayCourses.map((course, idx) => (
                  <div 
                    key={idx} 
                    // MOBILE FIX: Shrunk internal card padding (p-3 md:p-4)
                    className={`border p-3 md:p-4 rounded-xl flex justify-between items-start transition-all ${
                      course.isPetitioned 
                        ? 'bg-purple-50/30 border-purple-200' 
                        : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="flex-1 pr-2 md:pr-4">
                      {/* MOBILE FIX: Smaller text for the Course Code */}
                      <div className={`font-bold font-['Inter'] text-sm md:text-base ${course.isPetitioned ? 'text-purple-900' : 'text-[#003366]'}`}>
                        {course.code}
                      </div>
                      
                      <div className="text-gray-500 text-[11px] md:text-xs italic line-clamp-2 mt-0.5 md:mt-1">
                        {getCourseDescription(course.code) || course.title || course.name || "Description not found"}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 md:gap-2 shrink-0">
                      <div className="flex items-center justify-end gap-1.5 md:gap-2">
                        
                        {/* MOBILE FIX: Petitioned Badge - Just a Star on Mobile! */}
                        {course.isPetitioned && (
                          <span className="flex items-center justify-center md:px-3 md:py-1 rounded-md md:rounded-lg text-xs font-bold uppercase tracking-wide bg-purple-100 text-purple-700 border border-purple-200 w-6 h-6 md:w-auto md:h-auto shrink-0">
                            ★ <span className="hidden md:inline ml-1">Petitioned</span>
                          </span>
                        )}

                        {/* Enrolled Badge */}
                        {/* MOBILE FIX: Tighter padding on mobile */}
                        <span className="px-2 py-1 md:px-3 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wide bg-[#F97316]/10 text-[#F97316]">
                          Enrolled
                        </span>
                      </div>
                      
                      {/* Course Units */}
                      {course.units && (
                        <div className="text-gray-400 text-[10px] md:text-xs font-bold font-['Inter'] uppercase mt-1 pr-1">
                          {course.units} Units
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm font-medium italic p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                  No enrolled courses currently on record.
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default VerifyStudentModal;