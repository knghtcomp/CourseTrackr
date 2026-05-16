import React from 'react';
// IMPORTANT: Make sure this path points to your newly updated header file!
import { StudentDashboardHeaderSection } from "../DashBoard/StudentDashboardHeaderSection"; 
import { FutureCoursesSection } from "./FutureCoursesSection";

export const Tracker = () => {
  // Get current date to match the Dashboard design
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);

  return (
    // MOBILE FIX: Reduced bottom padding on phones to save space
    <main className="flex flex-col w-full min-h-screen bg-[#F4F7FA] font-sans pb-12 md:pb-24">
      
      {/* This will now pull the updated Inter font version! */}
      <StudentDashboardHeaderSection />

      {/* MOBILE FIX: Tightened top margin (mt-6 md:mt-10) and main section gap (gap-6 md:gap-12) */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-[58px] mt-6 md:mt-10 flex flex-col gap-6 md:gap-12">
        
        {/* PAGE TITLE */}
        <div className="w-full flex flex-col gap-1">
          {/* TITLE LINE */}
          {/* MOBILE FIX: Tighter gap between text and emoji on mobile */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* MOBILE FIX: Scaled down text to 28px for phones to prevent awkward wrapping */}
            <h1 className="text-[#003366] text-[28px] md:text-[32px] lg:text-[40px] font-bold font-['Calistoga'] leading-tight m-0">
              Academic Tracker
            </h1>
            {/* MOBILE FIX: Scaled emoji down slightly on phones */}
            <span className="text-2xl md:text-3xl animate-bounce">🗺️</span>
          </div>

          {/* SUBTEXT (No date, no vertical line) */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-1 md:gap-2 lg:gap-4 mt-0.5 md:mt-1">
            {/* MOBILE FIX: Scaled text down to text-sm on phones */}
            <p className="text-[#003366]/70 text-sm md:text-[16px] lg:text-[18px] italic font-['Calistoga'] m-0 leading-snug">
              Map out your curriculum, check prerequisites, and plan your next move.
            </p>
          </div>
        </div>

        {/* THE THREE IMPORTED SECTIONS */}
        <FutureCoursesSection />

      </div>
    </main>
  );
};

export default Tracker;