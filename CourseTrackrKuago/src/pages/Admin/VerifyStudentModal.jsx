import React, { useMemo } from 'react';

export const VerifyStudentModal = ({ student, onClose }) => {
  
  // Auto-merge the raw database rows
  const { displayCourses, completedCount, enrolledCount, petitionedCount } = useMemo(() => {
    const courseMap = new Map();
    
    (student.courses || []).forEach(course => {
      const key = course.code; 
      
      if (!courseMap.has(key)) {
        courseMap.set(key, { 
          ...course, 
          isPetitioned: false,
          status: course.status === 'petitioned' ? 'pending' : course.status 
        });
      }
      
      const current = courseMap.get(key);
      
      if (course.status === 'petitioned') {
        current.isPetitioned = true;
      } else if (course.status) {
        current.status = course.status;
      }
    });

    const mergedCourses = Array.from(courseMap.values());

    return {
      // 🚨 UI FIX: Strictly filter to ONLY show 'ongoing' (Enrolled) courses
      displayCourses: mergedCourses.filter(c => c.status === 'ongoing'),
      
      // The stat counters remain accurate
      completedCount: mergedCourses.filter(c => c.status === 'passed').length,
      enrolledCount: mergedCourses.filter(c => c.status === 'ongoing').length,
      petitionedCount: mergedCourses.filter(c => c.isPetitioned).length
    };
  }, [student.courses]);

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors text-2xl z-20">
          ✕
        </button>

        {/* Modal Header */}
        <div className="p-6 lg:p-8 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white/95 backdrop-blur z-10 pr-16">
          <div className="w-full">
            <h2 className="text-[#003366] text-2xl font-bold font-['Calistoga'] m-0">Student Check Report</h2>
            <p className="text-gray-500 font-medium font-['Inter'] mt-1">{student.name} ({student.studentId || student.school_id})</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 lg:p-8 flex flex-col gap-8">
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center shadow-sm">
              <div className="text-gray-500 text-sm font-semibold font-['Inter'] mb-1">Completed</div>
              <div className="text-[#003366] text-3xl font-bold font-['Inter']">{completedCount}</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center shadow-sm">
              <div className="text-gray-500 text-sm font-semibold font-['Inter'] mb-1">Enrolled</div>
              <div className="text-[#F59E0B] text-3xl font-bold font-['Inter']">{enrolledCount}</div>
            </div>
            <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100 text-center shadow-sm">
              <div className="text-purple-600/70 text-sm font-semibold font-['Inter'] mb-1">Petitioned</div>
              <div className="text-purple-600 text-3xl font-bold font-['Inter']">{petitionedCount}</div>
            </div>
          </div>

          {/* Enrolled Courses List */}
          <div>
            <h4 className="text-[#003366] text-sm font-bold font-['Inter'] uppercase tracking-wider mb-3">
              Enrolled Courses
            </h4>
            
            <div className="flex flex-col gap-3">
              {displayCourses.length > 0 ? (
                displayCourses.map((course, idx) => (
                  <div 
                    key={idx} 
                    className="border p-4 rounded-xl flex justify-between items-center transition-all bg-gray-50 border-gray-100"
                  >
                    <div>
                      <div className="font-bold font-['Inter'] text-[#003366]">
                        {course.code}
                      </div>
                      <div className="text-gray-500 text-sm font-medium line-clamp-1">{course.title || course.name}</div>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-end gap-2 shrink-0 ml-4">
                      
                      {/* Status Badges */}
                      {course.status === 'ongoing' && (
                        <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-[#F97316]/10 text-[#F97316]">
                          Enrolled
                        </span>
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