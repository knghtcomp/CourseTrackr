import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminDashboardHeaderSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminName, setAdminName] = useState('');

  // 1. Fetch and Verify the logged-in user
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // 🚨 THE SECURITY FIX: Check if they are actually an Admin!
        if (parsedUser.role !== 'admin') {
          // If a student tries to access this page, wipe their session and kick them out
          localStorage.removeItem('currentUser');
          navigate('/');
          return; // Stop running the rest of the code
        }
        
        // If they pass the check, set the Admin's Name
        if (parsedUser.firstName && parsedUser.lastName) {
          setAdminName(`${parsedUser.firstName} ${parsedUser.lastName}`);
        } else if (parsedUser.name) {
          setAdminName(parsedUser.name);
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
      }
    } else {
      // If no one is logged in at all, kick them to the login page
      navigate('/');
    }
  }, [navigate]);

  // 2. Destroy the session before leaving!
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
          <div className="flex flex-row items-center cursor-pointer" onClick={() => navigate('/admin')}>
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

          {/* Nav Buttons Container (Segmented Toggle UI) */}
          <div className="flex p-1.5 bg-black/20 rounded-2xl border border-white/10 backdrop-blur-sm ml-2 lg:ml-6">
            
            {/* Student Management Tab */}
            <button 
              onClick={() => navigate('/admin')}
              className={`flex items-center gap-2 px-4 h-10 rounded-xl transition-all duration-300 ease-out active:scale-95 group ${
                location.pathname === '/admin' || location.pathname === '/admin/dashboard'
                ? 'bg-[#FFCC00] text-[#001A33] shadow-[0_2px_10px_rgba(0,0,0,0.2)]' 
                : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105'
              }`}
            >
              <img 
                src="/dashboard.svg" 
                alt="" 
                className={`w-4 h-4 lg:w-5 lg:h-5 shrink-0 transition-all duration-300 ${
                  location.pathname === '/admin' || location.pathname === '/admin/dashboard' 
                  ? 'brightness-0 opacity-90' 
                  : 'brightness-0 invert opacity-70 group-hover:opacity-100'
                }`} 
              />
              <span className="text-[13px] lg:text-[15px] font-bold font-['Inter'] whitespace-nowrap">
                Student Management
              </span>
            </button>

            {/* FUTURE ADMIN TABS CAN GO HERE */}
            
          </div>

        </div>

        {/* GROUP 2: USER INFO & LOGOUT (Pinned to right edge) */}
        <div className="ml-auto flex items-center gap-4 lg:gap-6">
          
          {/* Display Admin Name and Role */}
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

          {/* Styled Logout Button with active press animation */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 h-9 bg-[#004080] text-white rounded-lg hover:bg-red-900 transition-all duration-300 ease-out active:scale-95 group shadow-md"
          >
            <img src="/logout.svg" alt="" className="w-4 h-4 lg:w-5 lg:h-5 shrink-0 brightness-0 invert group-hover:brightness-200 transition-all" />
            <span className="group-hover:text-white text-[13px] lg:text-[15px] font-normal font-['Croissant_One'] whitespace-nowrap">
              Logout
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default AdminDashboardHeaderSection;