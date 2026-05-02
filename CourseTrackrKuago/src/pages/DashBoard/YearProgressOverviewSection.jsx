import React from 'react';

export const YearProgressOverviewSection = () => {
  // DATA ARRAY: This makes it super easy to update numbers later!
  const progressData = [
    { id: 1, year: "1st Year", courses: "9/19 courses", percentage: 50 },
    { id: 2, year: "2nd Year", courses: "10/19 courses", percentage: 0 },
    { id: 3, year: "3rd Year", courses: "0/18 courses", percentage: 0 },
    { id: 4, year: "4th Year", courses: "0/6 courses", percentage: 0 },
  ];

  return (
    <div className="w-full bg-white/60 rounded-3xl border border-black/30 p-6 lg:p-10 shadow-sm flex flex-col gap-8">
      
      {/* SECTION TITLE */}
      <h2 className="text-[#003366] text-[24px] lg:text-[28px] font-bold font-['Calistoga'] tracking-wide m-0">
        Progress by Year Level
      </h2>

      {/* PROGRESS BARS CONTAINER */}
      <div className="flex flex-col gap-6">
        {progressData.map((data) => (
          <div key={data.id} className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6 w-full">
            
            {/* Labels (Year & Course Count) */}
            <div className="flex items-center gap-4 lg:w-48 shrink-0">
              <span className="text-[#003366] text-base lg:text-lg font-bold font-['Inter'] w-20">
                {data.year}
              </span>
              <span className="text-[#003366]/60 text-sm lg:text-base font-medium font-['Inter'] w-24">
                {data.courses}
              </span>
            </div>

            {/* The Visual Progress Bar */}
            <div className="flex-1 flex items-center gap-4">
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden relative">
                {/* The "Fill" of the bar */}
                <div 
                  className="h-full bg-[#003366] rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${data.percentage}%` }}
                />
              </div>
              
              {/* Percentage Text */}
              <span className="text-[#003366] text-base lg:text-lg font-bold font-['Inter'] w-12 text-right">
                {data.percentage}%
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* CURRENT STATUS BOX */}
      <div className="w-full bg-[#003366]/10 rounded-2xl border border-black/20 p-5 lg:p-6 mt-2 flex items-start gap-4 lg:gap-6">
        
        {/* Status Icon (Using an inline SVG so it looks perfect immediately) */}
        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#003366] rounded-full flex items-center justify-center shrink-0 mt-1 lg:mt-0 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Status Text */}
        <div className="flex flex-col gap-1">
          <h3 className="text-[#003366] text-lg lg:text-xl font-bold font-['Inter']">
            Current Status
          </h3>
          <p className="text-black/75 text-sm lg:text-base font-medium font-['Inter'] leading-relaxed">
            You are currently in <strong className="text-black">Year 1, Semester 2</strong>. You have <strong>10 ongoing courses</strong> and are on track to complete your degree.
          </p>
        </div>

      </div>

    </div>
  );
};

export default YearProgressOverviewSection;