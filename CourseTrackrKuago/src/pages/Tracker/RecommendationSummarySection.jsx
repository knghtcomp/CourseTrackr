import React from 'react';

export const RecommendationSummarySection = () => {
  // Data for this specific section
  const summaryStats = { eligible: 5, locked: 3, available: 15 };

  return (
    <section className="w-full bg-[#003366] rounded-2xl p-6 lg:p-10 shadow-lg flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
        <div className="w-12 h-12 bg-[#FFCC00] rounded-xl flex items-center justify-center shrink-0">
          <img src="/book.svg" alt="" className="w-6 h-6 brightness-0" />
        </div>
        <div>
          <h2 className="text-white text-xl lg:text-2xl font-bold font-['Inter']">Recommendation Summary</h2>
          <p className="text-white/80 text-sm lg:text-base font-light font-['Inter'] mt-1">
            Based on your completed courses and prerequisites, we found <strong>{summaryStats.eligible}</strong> courses you can take. <strong>{summaryStats.locked}</strong> courses are still locked due to unmet prerequisites.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        {[
          { label: "Eligible Courses", count: summaryStats.eligible },
          { label: "Locked Courses", count: summaryStats.locked },
          { label: "Available Courses", count: summaryStats.available },
        ].map((stat, idx) => (
          <div key={idx} className="bg-[#005080] rounded-xl p-5 flex flex-col justify-between border border-white/10 h-28">
            <span className="text-white text-4xl font-bold font-['Inter']">{stat.count}</span>
            <span className="text-white/80 text-lg font-medium font-['Inter']">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};