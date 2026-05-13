import React from 'react';
// Make sure these paths point to your actual tracker components!
import { FutureCoursesSection } from '../tracker/FutureCoursesSection';
import { LockedCoursesSection } from '../tracker/LockedCoursesSection';

export const AdminTrackerModal = ({ student, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#F4F7FA] rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 lg:p-8 border-b border-gray-200 flex justify-between items-start shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-[#003366] text-2xl font-bold font-['Calistoga'] m-0">Student Tracker View</h2>
              <span className="text-2xl">🗺️</span>
            </div>
            <p className="text-gray-500 font-medium font-['Inter'] mt-1">
              {student.name} ({student.studentId || student.school_id}) - Year {student.yearLevel}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors text-2xl shrink-0">
            ✕
          </button>
        </div>

        {/* Scrollable Tracker Body */}
        <div className="p-6 lg:p-10 overflow-y-auto flex-1 flex flex-col gap-10">
           {/* We pass the 'targetStudent' prop down to tell the components NOT to use local storage */}
           <FutureCoursesSection targetStudent={student} />
           <LockedCoursesSection targetStudent={student} />
        </div>

      </div>
    </div>
  );
};

export default AdminTrackerModal;