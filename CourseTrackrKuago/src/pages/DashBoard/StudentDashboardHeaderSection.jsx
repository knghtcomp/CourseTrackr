import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const StudentDashboardHeaderSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState('');
  const [yearStanding, setYearStanding] = useState(''); 

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
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
    localStorage.removeItem('currentUser');
    localStorage.removeItem('setupLocked');
    localStorage.removeItem('gradingPortalOpen');
    navigate('/');
  };

  return (
    <header className="w-full h-[90px] bg-[#003366] flex items-center relative shadow-lg z-50">
      <div className="w-full max-w-[1440px] mx-auto flex items-center px-4 lg:px-6 h-full">
        
        {/* GROUP 1: Branding + Navigation Links */}
        <div className="flex flex-row items-center -ml-6 lg:-ml-8 gap-6 lg:gap-10">
          
          {/* Logo & Text */}
          <div className="flex flex-row items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img 
              src="/logo.svg" 
              alt="Logo" 
              className="w-12 h-12 lg:w-14 lg:h-14 -mr-1 drop-shadow-lg" 
            />
            <div className="flex flex-col justify-center ml-2">
              <h1 className="text-[22px] lg:text-[26px] xl:text-[30px] font-bold text-white leading-none font-['Calistoga'] m-0 tracking-tight">
                COURSETRACKR
              </h1>
              <h2 className="text-[12px] lg:text-[14px] xl:text-[16px] text-[#FFCC00] font-['Calistoga'] m-0 mt-0.5 whitespace-nowrap">
                Academic Management Tool
              </h2>
            </div>
          </div>

          {/* Nav Buttons Container */}
          {/* Nav Buttons Container (Segmented Toggle UI) */}
          <div className="flex p-1.5 bg-black/20 rounded-2xl border border-white/10 backdrop-blur-sm ml-2 lg:ml-6">
            
            {/* DASHBOARD BUTTON */}
            <button 
              onClick={() => navigate('/dashboard')}
              className={`flex items-center gap-2 px-4 h-10 rounded-xl transition-all duration-300 group ${
                isActive === 'dashboard' 
                ? 'bg-[#FFCC00] text-[#001A33] shadow-[0_2px_10px_rgba(0,0,0,0.2)]' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <img 
                src="/dashboard.svg" 
                alt="" 
                className={`w-4 h-4 lg:w-5 lg:h-5 shrink-0 transition-all duration-300 ${
                  isActive === 'dashboard' ? 'brightness-0 opacity-90' : 'brightness-0 invert opacity-70 group-hover:opacity-100'
                }`} 
              />
              <span className="text-[13px] lg:text-[15px] font-bold font-['Inter'] whitespace-nowrap">
                Dashboard
              </span>
            </button>

            {/* TRACKER BUTTON */}
            <button 
              onClick={() => navigate('/tracker')}
              className={`flex items-center gap-2 px-4 h-10 rounded-xl transition-all duration-300 group ${
                isActive === 'tracker' 
                ? 'bg-[#FFCC00] text-[#001A33] shadow-[0_2px_10px_rgba(0,0,0,0.2)]' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <img 
                src="/trackr.svg" 
                alt="" 
                className={`w-4 h-4 lg:w-5 lg:h-5 shrink-0 transition-all duration-300 ${
                  isActive === 'tracker' ? 'brightness-0 opacity-90' : 'brightness-0 invert opacity-70 group-hover:opacity-100'
                }`} 
              />
              <span className="text-[13px] lg:text-[15px] font-bold font-['Inter'] whitespace-nowrap">
                Tracker
              </span>
            </button>

            {/* ACADEMIC HISTORY BUTTON */}
            <button 
              onClick={() => navigate('/history')}
              className={`flex items-center gap-2 px-4 h-10 rounded-xl transition-all duration-300 group ${
                isActive === 'history' 
                ? 'bg-[#FFCC00] text-[#001A33] shadow-[0_2px_10px_rgba(0,0,0,0.2)]' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <img 
                src="/academichistory.svg" 
                alt="" 
                className={`w-4 h-4 lg:w-5 lg:h-5 shrink-0 transition-all duration-300 ${
                  isActive === 'history' ? 'brightness-0 opacity-90' : 'brightness-0 invert opacity-70 group-hover:opacity-100'
                }`} 
              />
              <span className="text-[13px] lg:text-[15px] font-bold font-['Inter'] whitespace-nowrap">
                Evaluation
              </span>
            </button>

          </div>

        </div>

        {/* GROUP 2: USER INFO & LOGOUT (Pinned to right edge) */}
        <div className="ml-auto flex items-center gap-4 lg:gap-6">
          
          {/* Display User Name and Year Standing */}
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

          {/* Logout Button (Matching Glassy Segmented UI) */}
          <div className="flex p-1.5 bg-black/20 rounded-2xl border border-white/10 backdrop-blur-sm">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 h-10 rounded-xl transition-all duration-300 group text-gray-300 hover:text-white hover:bg-white/10"
            >
              <img 
                src="/logout.svg" 
                alt="" 
                className="w-4 h-4 lg:w-5 lg:h-5 shrink-0 transition-all duration-300 brightness-0 invert opacity-70 group-hover:opacity-100" 
              />
              <span className="text-[13px] lg:text-[15px] font-bold font-['Inter'] whitespace-nowrap">
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