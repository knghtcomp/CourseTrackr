import React from 'react';

// ✅ THE FIX: Tell the component to accept the 'count' passed down from Dashboard.jsx
export const OngoingCoursesStatsSection = ({ count = 0 }) => {
  return (
    <div className="w-full bg-white/60 rounded-2xl md:rounded-3xl border border-black/30 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm min-h-[76px] md:min-h-[88px]">
      <div className="flex flex-col gap-0.5 md:gap-1">
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-md flex items-center justify-center shrink-0 shadow-inner">
            <img src="/clock.svg" alt="" className="w-3.5 h-3.5 md:w-4 md:h-4 " />
          </div>
          <p className="text-black/80 text-[10px] md:text-xs font-bold font-['Calistoga'] uppercase tracking-wider leading-tight">
            Enrolled Courses
          </p>
        </div>
        <p className="text-black/60 text-[10px] md:text-xs font-medium font-['Inter'] pl-6 md:pl-8">
          Current Semester
        </p>
      </div>
      <h3 className="text-[#003366] text-3xl md:text-5xl font-bold font-['Inter'] leading-none">
        {count}
      </h3>
    </div>
  );
};