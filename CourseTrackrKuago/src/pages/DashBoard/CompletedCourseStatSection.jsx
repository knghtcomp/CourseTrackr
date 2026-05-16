import React from 'react';
 
// ✅ THE FIX: Tell the component to accept the 'count' passed down from Dashboard.jsx
export const CompletedCoursesStatsSection = ({ count = 0 }) => {
  return (
    // MOBILE FIX: Scaled down padding, corner radius, and minimum height for phones
    <div className="w-full bg-white/60 rounded-2xl md:rounded-3xl border border-black/30 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm min-h-[76px] md:min-h-[88px]">
      <div className="flex flex-col gap-0.5 md:gap-1">
        {/* MOBILE FIX: Tighter gap between icon and text */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* MOBILE FIX: Scaled icon box down slightly on phones */}
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-md flex items-center justify-center shrink-0">
            <img src="/checkmark.svg" alt="" className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </div>
          {/* MOBILE FIX: Scaled text down to 10px so "Completed Course" doesn't wrap on small screens */}
          <p className="text-black/80 text-[10px] md:text-xs font-bold font-['Calistoga'] uppercase tracking-wider leading-tight">
            Completed Course
          </p>
        </div>
        {/* MOBILE FIX: Scaled subtitle and adjusted the left padding to align perfectly with the text above */}
        <p className="text-black/60 text-[10px] md:text-xs font-medium font-['Inter'] pl-6 md:pl-8">
          Out of 64 courses
        </p>
      </div>
      {/* MOBILE FIX: Shrunk the massive number from 5xl down to 3xl on phones */}
      <h3 className="text-[#003366] text-3xl md:text-5xl font-semibold font-['Inter'] leading-none">
        {count}
      </h3>
    </div>
  );
};