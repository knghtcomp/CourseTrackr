import React from 'react';
// IMPORTANT: Make sure this path points to your newly updated header file!
import { StudentDashboardHeaderSection } from "../dashboard/StudentDashboardHeaderSection"; 

import { FutureCoursesSection } from "./FutureCoursesSection";
import { LockedCoursesSection } from "./LockedCoursesSection";

export const Tracker = () => {
  // Get current date to match the Dashboard design
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);

  return (
    <main className="flex flex-col w-full min-h-screen bg-[#F4F7FA] font-sans pb-24">
      
      {/* This will now pull the updated Inter font version! */}
      <StudentDashboardHeaderSection />

      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-[58px] mt-10 flex flex-col gap-12">
        
        {/* PAGE TITLE */}
        <div className="w-full flex flex-col gap-1">
          {/* TITLE LINE */}
          <div className="flex items-center gap-3">
            {/* THE TEXT FIX: Updated to "Course Suggestions" */}
            <h1 className="text-[#003366] text-[32px] lg:text-[40px] font-bold font-['Calistoga'] leading-tight m-0">
              Course Suggestions
            </h1>
            <span className="text-3xl animate-bounce">🎯</span>
          </div>

          {/* SUBTEXT (No date, no vertical line) */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mt-1">
            {/* THE TEXT FIX: Updated the subtext */}
            <p className="text-[#003366]/70 text-[16px] lg:text-[18px] italic font-['Calistoga'] m-0">
              Based on your standing, here are your next available subjects.
            </p>
          </div>
        </div>

        {/* THE THREE IMPORTED SECTIONS */}

        <FutureCoursesSection />
        <LockedCoursesSection />

      </div>
    </main>
  );
};

export default Tracker;