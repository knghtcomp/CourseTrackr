import React, { useState, useEffect } from 'react';
 
export const CompletedCoursesStatsSection = () => {
  const [count, setCount] = useState(0);
 
  useEffect(() => {
    const fetchRecords = async () => {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) return;
      const currentUser = JSON.parse(currentUserStr);
      try {
        const response = await fetch(`http://localhost:5000/api/student-records/${currentUser.id}`);
        if (response.ok) {
          const records = await response.json();
          setCount(records.filter(r => r.status === 'passed').length);
        }
      } catch (err) {
        console.error("Failed to load completed courses:", err);
      }
    };
    fetchRecords();
  }, []);
 
  return (
    <div className="w-full bg-white/60 rounded-3xl border border-black/30 px-6 py-4 flex items-center justify-between shadow-sm min-h-[88px]">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center shrink-0">
            <img src="/checkmark.svg" alt="" className="w-4 h-4" />
          </div>
          <p className="text-black/80 text-xs font-bold font-['Calistoga'] uppercase tracking-wider">
            Completed Course
          </p>
        </div>
        <p className="text-black/60 text-xs font-medium font-['Inter'] pl-8">
          Out of 64 courses
        </p>
      </div>
      <h3 className="text-[#003366] text-5xl font-semibold font-['Inter'] leading-none">
        {count}
      </h3>
    </div>
  );
};