import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const StudentDashboardHeaderSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState('');
  const [yearStanding, setYearStanding] = useState(''); 

  useEffect(() => {
    const storedUser = localStorage.getItem('studentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        if (parsedUser.firstName && parsedUser.lastName) {
          setUserName(`${parsedUser.firstName} ${parsedUser.lastName}`);
        } else if (parsedUser.name) {
          setUserName(parsedUser.name);
        }

        if (parsedUser.yearStanding) {
          setYearStanding(`Year ${parsedUser.yearStanding} Student`);
        } else {
          setYearStanding('Student Account');
        }

      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
      }
    }
  }, []);

  const isActive = location.pathname.includes('tracker') 
    ? 'tracker' 
    : location.pathname.includes('history') 
    ? 'history' 
    : 'dashboard';

  const handleLogout = () => {
    localStorage.removeItem('studentUser');
    localStorage.removeItem('setupLocked');
    localStorage.removeItem('gradingPortalOpen');
    navigate('/');
  };

  return (
    <header 
      className="w-full h-[60px] md:h-[90px] flex items-center relative shadow-lg z-[100] shrink-0 bg-gradient-to-r from-[#001A33] to-[#004080]"
    >
      <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between px-3 md:px-6 h-full gap-2">
        
        {/* ==============================
            LEFT SIDE: LOGO + NAVIGATION
        ============================== */}
        <div className="flex items-center gap-3 md:gap-8 lg:gap-12">
          
          {/* LOGO */}
          <div 
            className="flex items-center cursor-pointer shrink-0" 
            onClick={() => navigate('/dashboard')}
          >
            <img 
              src="/logo.svg" 
              alt="Logo" 
              className="w-8 h-8 md:w-14 md:h-14 drop-shadow-lg" 
            />
            <div className="flex flex-col justify-center ml-1 md:ml-2">
              <h1 className="text-[14px] md:text-[22px] lg:text-[26px] xl:text-[30px] font-bold text-white leading-none font-['Calistoga'] m-0 tracking-tight">
                COURSETRACKR
              </h1>
              <h2 className="text-[8px] md:text-[12px] lg:text-[14px] xl:text-[16px] text-[#FFCC00] font-['Calistoga'] m-0 md:mt-0.5 whitespace-nowrap">
                Academic Management Tool
              </h2>
            </div>
          </div>

          {/* NAVIGATION (The Toggle) */}
          <div className="flex p-1 bg-black/20 rounded-xl md:rounded-2xl border border-white/10 backdrop-blur-sm gap-1 md:gap-2">
            
            {/* DASHBOARD BUTTON */}
            <button 
              title="Dashboard"
              onClick={() => navigate('/dashboard')}
              // MOBILE FIX: Scaled down from w-10 h-10 to w-8 h-8 on phones to prevent overlapping
              className={`flex items-center justify-center md:gap-2 w-8 h-8 md:w-auto md:px-4 md:h-10 rounded-lg md:rounded-xl transition-all duration-300 active:scale-95 group ${
                isActive === 'dashboard' 
                ? 'bg-[#FFCC00] shadow-[0_2px_10px_rgba(0,0,0,0.2)]' 
                : 'hover:bg-white/10'
              }`}
            >
              <img 
                src="/dashboard.svg" 
                alt="Dashboard" 
                // MOBILE FIX: Scaled icon down from w-5 h-5 to w-4 h-4 on phones
                className={`w-4 h-4 md:w-5 md:h-5 shrink-0 transition-all duration-300 ${
                  isActive === 'dashboard' ? 'brightness-0 opacity-90' : 'brightness-0 invert opacity-70 group-hover:opacity-100'
                }`} 
              />
              <span className={`hidden md:block text-[13px] lg:text-[15px] font-bold font-['Inter'] whitespace-nowrap ${isActive === 'dashboard' ? 'text-[#001A33]' : 'text-gray-300 group-hover:text-white'}`}>
                Dashboard
              </span>
            </button>

            {/* TRACKER BUTTON */}
            <button 
              title="Tracker"
              onClick={() => navigate('/tracker')}
              // MOBILE FIX: Scaled down from w-10 h-10 to w-8 h-8 on phones
              className={`flex items-center justify-center md:gap-2 w-8 h-8 md:w-auto md:px-4 md:h-10 rounded-lg md:rounded-xl transition-all duration-300 active:scale-95 group ${
                isActive === 'tracker' 
                ? 'bg-[#FFCC00] shadow-[0_2px_10px_rgba(0,0,0,0.2)]' 
                : 'hover:bg-white/10'
              }`}
            >
              <img 
                src="/trackr.svg" 
                alt="Tracker" 
                // MOBILE FIX: Scaled icon down from w-5 h-5 to w-4 h-4 on phones
                className={`w-4 h-4 md:w-5 md:h-5 shrink-0 transition-all duration-300 ${
                  isActive === 'tracker' ? 'brightness-0 opacity-90' : 'brightness-0 invert opacity-70 group-hover:opacity-100'
                }`} 
              />
              <span className={`hidden md:block text-[13px] lg:text-[15px] font-bold font-['Inter'] whitespace-nowrap ${isActive === 'tracker' ? 'text-[#001A33]' : 'text-gray-300 group-hover:text-white'}`}>
                Tracker
              </span>
            </button>

            {/* EVALUATION BUTTON */}
            <button 
              title="Evaluation"
              onClick={() => navigate('/history')}
              // MOBILE FIX: Scaled down from w-10 h-10 to w-8 h-8 on phones
              className={`flex items-center justify-center md:gap-2 w-8 h-8 md:w-auto md:px-4 md:h-10 rounded-lg md:rounded-xl transition-all duration-300 active:scale-95 group ${
                isActive === 'history' 
                ? 'bg-[#FFCC00] shadow-[0_2px_10px_rgba(0,0,0,0.2)]' 
                : 'hover:bg-white/10'
              }`}
            >
              <img 
                src="/academichistory.svg" 
                alt="Evaluation" 
                // MOBILE FIX: Scaled icon down from w-5 h-5 to w-4 h-4 on phones
                className={`w-4 h-4 md:w-5 md:h-5 shrink-0 transition-all duration-300 ${
                  isActive === 'history' ? 'brightness-0 opacity-90' : 'brightness-0 invert opacity-70 group-hover:opacity-100'
                }`} 
              />
              <span className={`hidden md:block text-[13px] lg:text-[15px] font-bold font-['Inter'] whitespace-nowrap ${isActive === 'history' ? 'text-[#001A33]' : 'text-gray-300 group-hover:text-white'}`}>
                Evaluation
              </span>
            </button>

          </div>
        </div>

        {/* ==============================
            RIGHT SIDE: USER INFO + LOGOUT
        ============================== */}
        <div className="flex items-center gap-2 md:gap-4 lg:gap-6 shrink-0">
          
          {/* Display User Name and Year Standing (Hidden on mobile) */}
          {userName && (
            <div className="hidden md:flex flex-col items-end">
              <span className="text-white text-[14px] lg:text-[15px] font-bold font-['Inter']">
                {userName}
              </span>
              <span className="text-[#FFCC00] text-[11px] lg:text-[12px] font-medium font-['Inter'] tracking-wider uppercase">
                {yearStanding}
              </span>
            </div>
          )}

          {/* Logout Button */}
          <div className="flex p-1 bg-black/20 rounded-xl md:rounded-2xl border border-white/10 backdrop-blur-sm">
            <button 
              title="Logout"
              onClick={handleLogout}
              className="flex items-center justify-center md:gap-2 w-8 h-8 md:w-auto md:px-4 md:h-10 rounded-lg md:rounded-xl transition-all duration-300 active:scale-95 group hover:bg-white/10"
            >
              <img 
                src="/logout.svg" 
                alt="Logout" 
                className="w-5 h-5 shrink-0 transition-all duration-300 brightness-0 invert opacity-70 group-hover:opacity-100" 
              />
              <span className="hidden md:block text-[13px] lg:text-[15px] font-bold font-['Inter'] whitespace-nowrap text-gray-300 group-hover:text-white">
                Logout
              </span>
            </button>
          </div>
          
        </div>

      </div>
    </header>
  );
};

export default StudentDashboardHeaderSection;