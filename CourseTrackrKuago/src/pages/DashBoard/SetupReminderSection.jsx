import { hash } from 'node:crypto';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const SetupReminderSection = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-gradient-to-r from-[#001A33] to-[#00509E] rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg relative overflow-hidden border border-[#003366]">
      
      {/* Subtle decorative glow effects */}
      <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-[#FFCC00]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* LEFT SIDE: Icon & Text */}
      <div className="flex gap-4 lg:gap-6 items-start md:items-center z-10">
        
        {/* ICON BOX (Solid Yellow Background with hover spin) */}
        <div className="group w-12 h-12 lg:w-16 lg:h-16 bg-[#FFCC00] rounded-2xl flex items-center justify-center shrink-0 shadow-inner cursor-pointer">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 lg:h-8 lg:w-8 text-[#001A33] transition-transform duration-700 ease-out group-hover:rotate-180" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        {/* TEXT CONTAINER */}
        <div className="flex flex-col gap-1.5 lg:gap-2 max-w-3xl">
          <h2 className="text-white text-xl lg:text-2xl font-bold font-['Calistoga'] m-0 tracking-wide">
            Complete your academic setup
          </h2>
          <p className="text-white/80 text-sm lg:text-base font-medium font-['Inter'] leading-relaxed m-0">
            To get personalized course recommendations and track your progress, please complete your academic setup by selecting the courses you've already finished.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Action Button */}
      <button 
        onClick={() => navigate('/setup')} 
        className="shrink-0 w-full md:w-auto bg-[#FFCC00] text-[#001A33] px-6 py-3 lg:px-8 lg:py-4 rounded-2xl font-['Calistoga'] text-lg hover:bg-yellow-400 hover:shadow-[0_0_15px_rgba(255,204,0,0.4)] hover:-translate-y-0.5 transition-all duration-300 z-10"
      >
        Complete Setup Now!!
      </button>

    </div>
  );
};

export default SetupReminderSection;
