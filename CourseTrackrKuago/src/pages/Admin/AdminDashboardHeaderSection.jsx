import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminDashboardHeaderSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminName, setAdminName] = useState('');

  // 1. Fetch and Verify the logged-in user
  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        if (parsedUser.role !== 'admin') {
          localStorage.removeItem('adminUser');
          navigate('/');
          return; 
        }
        
        if (parsedUser.firstName && parsedUser.lastName) {
          setAdminName(`${parsedUser.firstName} ${parsedUser.lastName}`);
        } else if (parsedUser.name) {
          setAdminName(parsedUser.name);
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  // 2. Destroy the session before leaving!
  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('setupLocked');
    localStorage.removeItem('gradingPortalOpen');
    navigate('/');
  };

  return (
    <header 
      // Made the header slightly shorter on mobile (70px) and normal on desktop (90px)
      className="w-full h-[70px] lg:h-[90px] flex items-center relative shadow-lg z-50 shrink-0"
      style={{ background: 'linear-gradient(to right, #001A33, #004080)' }}
    >
      <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between px-4 lg:px-6 h-full">
        
        {/* GROUP 1: Branding + Navigation Links */}
        <div className="flex flex-row items-center gap-2 md:gap-6 lg:gap-10">
          
          {/* Logo & Text */}
          <div className="flex flex-row items-center cursor-pointer" onClick={() => navigate('/admin')}>
            <img 
              src="/logo.svg" 
              alt="Logo" 
              className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 drop-shadow-lg shrink-0" 
            />
            {/* 🚨 MOBILE FIX: Hidden on mobile, visible on md and up */}
            <div className="hidden md:flex flex-col justify-center ml-2">
              <h1 className="text-[22px] lg:text-[26px] xl:text-[30px] font-bold text-white leading-none font-['Calistoga'] m-0 tracking-tight">
                COURSETRACKR
              </h1>
              <h2 className="text-[12px] lg:text-[14px] xl:text-[16px] text-[#FFCC00] font-['Calistoga'] m-0 mt-0.5 whitespace-nowrap">
                Academic Management Tool
              </h2>
            </div>
          </div>

          {/* Nav Buttons Container */}
          <div className="flex p-1.5 bg-black/20 rounded-2xl border border-white/10 backdrop-blur-sm ml-1 md:ml-2 lg:ml-6">
            
            {/* Student Management Tab */}
            <button 
              onClick={() => navigate('/admin')}
              // 🚨 MOBILE FIX: Adjust padding for mobile so it looks like a square icon button
              className={`flex items-center justify-center md:gap-2 px-3 md:px-4 h-10 rounded-xl transition-all duration-300 ease-out active:scale-95 group ${
                location.pathname === '/admin' || location.pathname === '/admin/dashboard'
                ? 'bg-[#FFCC00] text-[#001A33] shadow-[0_2px_10px_rgba(0,0,0,0.2)]' 
                : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105'
              }`}
            >
              <img 
                src="/dashboard.svg" 
                alt="" 
                className={`w-5 h-5 shrink-0 transition-all duration-300 ${
                  location.pathname === '/admin' || location.pathname === '/admin/dashboard' 
                  ? 'brightness-0 opacity-90' 
                  : 'brightness-0 invert opacity-70 group-hover:opacity-100'
                }`} 
              />
              {/* 🚨 MOBILE FIX: Hide text on mobile */}
              <span className="hidden md:block text-[13px] lg:text-[15px] font-bold font-['Inter'] whitespace-nowrap">
                Student Management
              </span>
            </button>

            {/* FUTURE ADMIN TABS (Trackr, Evaluation) CAN GO HERE following the same format! */}
            
          </div>

        </div>

        {/* GROUP 2: USER INFO & LOGOUT (Pinned to right edge) */}
        <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
          
          {/* Display Admin Name and Role (Already hidden on mobile!) */}
          {adminName && (
            <div className="hidden md:flex flex-col items-end">
              <span className="text-white text-[14px] lg:text-[15px] font-bold font-['Inter']">
                {adminName}
              </span>
              <span className="text-[#FFCC00] text-[11px] lg:text-[12px] font-bold font-['Inter'] tracking-wider uppercase">
                Admin
              </span>
            </div>
          )}

          {/* Styled Logout Button */}
          <button 
            onClick={handleLogout}
            // 🚨 MOBILE FIX: Shrink padding to act as an icon button on small screens
            className="flex items-center justify-center md:gap-2 px-3 md:px-4 h-10 bg-[#004080] text-white rounded-xl hover:bg-red-900 transition-all duration-300 ease-out active:scale-95 group shadow-md"
          >
            <img src="/logout.svg" alt="" className="w-5 h-5 shrink-0 brightness-0 invert group-hover:brightness-200 transition-all" />
            {/* 🚨 MOBILE FIX: Hide text on mobile */}
            <span className="hidden md:block group-hover:text-white text-[13px] lg:text-[15px] font-normal font-['Croissant_One'] whitespace-nowrap">
              Logout
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default AdminDashboardHeaderSection;