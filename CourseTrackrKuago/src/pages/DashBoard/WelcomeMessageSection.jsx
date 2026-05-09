import React from 'react';
import { useNavigate } from 'react-router-dom';

export const WelcomeMessageSection = ({ showSetupReminder = true }) => {
  const navigate = useNavigate();
  
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);

  return (
    <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      
      {/* LEFT SIDE: Welcome Message & Date */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h2 className="text-[#003366] text-[32px] lg:text-[40px] font-bold font-['Calistoga'] leading-tight m-0">
            Student Dashboard
          </h2>
          <span className="text-3xl animate-bounce">👋</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mt-1">
          <p className="text-gray-600 text-[16px] lg:text-[18px] font-medium font-sans m-0">
            {formattedDate}
          </p>
          <span className="hidden lg:block text-gray-300">|</span>
          <p className="text-[#003366]/70 text-[16px] lg:text-[18px] italic font-['Calistoga'] m-0">
            Ready to track your academic journey at USTP?
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Compact Setup Reminder (Premium Vibrant UI) */}
      {showSetupReminder && (
        <div className="group flex items-center gap-3 lg:gap-4 bg-gradient-to-br from-[#FFD700] via-[#FFCC00] to-[#FFB800] p-2 pr-2 lg:p-2.5 lg:pr-2.5 rounded-2xl lg:rounded-[20px] shadow-[0_4px_20px_-4px_rgba(255,204,0,0.6)] border border-yellow-300/50 shrink-0 relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_25px_-5px_rgba(255,204,0,0.8)] hover:-translate-y-0.5 cursor-pointer">
          
          {/* Subtle animated shine effect sweeping across the background on hover */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full transition-transform duration-1000 skew-x-12 ease-in-out"></div>

          {/* ICON BOX - Premium Dark Glass */}
          <div className="relative w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-b from-[#001A33] to-[#003366] rounded-xl flex items-center justify-center shrink-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.15)] border border-[#004080] z-10">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 lg:h-6 lg:w-6 text-[#FFCC00] drop-shadow-[0_0_6px_rgba(255,204,0,0.8)] transition-transform duration-700 ease-out group-hover:rotate-180" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          {/* ACTION BUTTON */}
          <button 
            onClick={() => navigate('/setup')} 
            className="relative z-10 bg-[#001A33] text-white px-5 py-2.5 lg:px-6 lg:py-3 rounded-xl font-['Calistoga'] text-sm lg:text-base tracking-wide border border-[#001A33] hover:bg-[#001A33] hover:border-white/20 hover:shadow-[0_0_15px_rgba(0,26,51,0.5)] transition-all duration-300 whitespace-nowrap overflow-hidden"
          >
            <span className="relative z-10 drop-shadow-md">Complete Setup Now</span>
          </button>
          
        </div>
      )}

    </div>
  );
};

export default WelcomeMessageSection;