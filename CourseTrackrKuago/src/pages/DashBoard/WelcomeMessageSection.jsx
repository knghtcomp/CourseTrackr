import React from 'react';
import { useNavigate } from 'react-router-dom';

export const WelcomeMessageSection = ({ showSetupReminder = true }) => {
  const navigate = useNavigate();
  
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);

  return (
    <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
      
      {/* LEFT SIDE: Welcome Message & Date */}
      <div className="flex flex-col gap-1 w-full md:w-auto">
        <div className="flex items-center gap-2 md:gap-3">
          <h2 className="text-[#003366] text-[28px] md:text-[32px] lg:text-[40px] font-bold font-['Calistoga'] leading-tight m-0">
            Student Dashboard
          </h2>
          <span className="text-2xl md:text-3xl animate-bounce">👋</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-1 md:gap-2 lg:gap-4 mt-1">
          <p className="text-gray-600 text-sm md:text-[16px] lg:text-[18px] font-medium font-sans m-0">
            {formattedDate}
          </p>
          <span className="hidden lg:block text-gray-300">|</span>
          <p className="text-[#003366]/70 text-sm md:text-[16px] lg:text-[18px] italic font-['Calistoga'] m-0">
            Ready to track your academic journey at USTP?
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Clean & Premium Setup Button (Restored Shape & Padding) */}
      {showSetupReminder && (
        <button 
          onClick={() => navigate('/setup')}
          // FIX: Removed w-full so it doesn't stretch. Restored original padding (p-2 lg:p-2.5) and corners (rounded-2xl lg:rounded-[20px])
          className="mt-2 md:mt-0 group flex items-center justify-start gap-3 bg-[#003366] hover:bg-[#002244] p-2 pr-4 lg:p-2.5 lg:pr-6 rounded-2xl lg:rounded-[20px] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer border border-[#002244]"
        >
          {/* Circular Yellow Icon Box - Restored to rounded-xl to match the outer card */}
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#FFCC00] rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:rotate-180 shadow-inner">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 lg:h-6 lg:w-6 text-[#003366]" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <span className="font-['Calistoga'] text-white text-sm lg:text-base tracking-wide whitespace-nowrap">
            Complete Setup Now
          </span>
        </button>
      )}

    </div>
  );
};

export default WelcomeMessageSection;