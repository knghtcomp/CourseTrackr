import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminDashboardHeaderSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminName, setAdminName] = useState('');

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

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('setupLocked');
    localStorage.removeItem('gradingPortalOpen');
    navigate('/');
  };

  return (
    <header 
      // Very slim on mobile (60px height)
      className="w-full h-[60px] md:h-[90px] flex items-center relative shadow-lg z-50 shrink-0"
      style={{ background: 'linear-gradient(to right, #001A33, #004080)' }}
    >
      <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between px-3 md:px-6 h-full">
        
        {/* ==============================
            1. LOGO (Left)
        ============================== */}
        <div 
          className="flex items-center cursor-pointer shrink-0" 
          onClick={() => navigate('/admin')}
        >
          {/* Mobile: 32x32px, Desktop: 56x56px */}
          <img 
            src="/logo.svg" 
            alt="Logo" 
            className="w-8 h-8 md:w-14 md:h-14 drop-shadow-lg" 
          />
          {/* TEXT: Now visible on mobile with properly scaled responsive sizes */}
          <div className="flex flex-col justify-center ml-1 md:ml-2">
            <h1 className="text-[14px] md:text-[22px] lg:text-[26px] xl:text-[30px] font-bold text-white leading-none font-['Calistoga'] m-0 tracking-tight">
              COURSETRACKR
            </h1>
            <h2 className="text-[8px] md:text-[12px] lg:text-[14px] xl:text-[16px] text-[#FFCC00] font-['Calistoga'] m-0 md:mt-0.5 whitespace-nowrap">
              Academic Management Tool
            </h2>
          </div>
        </div>

        {/* ==============================
            2. NAVIGATION ICONS (Center)
        ============================== */}
        <div className="flex items-center p-1 bg-black/20 rounded-xl md:rounded-2xl border border-white/10 backdrop-blur-sm gap-1 md:gap-2">
          
          {/* Dashboard Icon */}
          <button 
            title="Dashboard"
            onClick={() => navigate('/admin')}
            // MOBILE FIX: w-10 h-10 forces a perfect square box. Desktop uses auto width and px-4.
            className={`flex items-center justify-center md:gap-2 w-10 h-10 md:w-auto md:px-4 md:h-10 rounded-lg md:rounded-xl transition-all duration-300 ease-out active:scale-95 group ${
              location.pathname === '/admin' || location.pathname === '/admin/dashboard'
              ? 'bg-[#FFCC00] shadow-md' 
              : 'hover:bg-white/10'
            }`}
          >
            <img 
              src="/dashboard.svg" 
              alt="Dashboard" 
              className={`w-5 h-5 transition-all duration-300 ${
                location.pathname === '/admin' || location.pathname === '/admin/dashboard' 
                ? 'brightness-0 opacity-90' 
                : 'brightness-0 invert opacity-70 group-hover:opacity-100'
              }`} 
            />
            {/* TEXT: Strictly hidden on mobile */}
            <span className={`hidden md:block text-[15px] font-bold font-['Inter'] whitespace-nowrap ${location.pathname === '/admin' || location.pathname === '/admin/dashboard' ? 'text-[#001A33]' : 'text-gray-300 group-hover:text-white'}`}>
              Dashboard
            </span>
          </button>

          {/* Trackr Icon */}
          <button 
            title="Trackr"
            onClick={() => navigate('/admin/trackr')}
            // MOBILE FIX: w-10 h-10 perfect square.
            className={`flex items-center justify-center md:gap-2 w-10 h-10 md:w-auto md:px-4 md:h-10 rounded-lg md:rounded-xl transition-all duration-300 ease-out active:scale-95 group ${
              location.pathname === '/admin/trackr'
              ? 'bg-[#FFCC00] shadow-md' 
              : 'hover:bg-white/10'
            }`}
          >
            <img 
              src="/trackr.svg"
              alt="Trackr" 
              className={`w-5 h-5 transition-all duration-300 ${
                location.pathname === '/admin/trackr' 
                ? 'brightness-0 opacity-90' 
                : 'brightness-0 invert opacity-70 group-hover:opacity-100'
              }`} 
            />
            {/* TEXT: Strictly hidden on mobile */}
            <span className={`hidden md:block text-[15px] font-bold font-['Inter'] whitespace-nowrap ${location.pathname === '/admin/trackr' ? 'text-[#001A33]' : 'text-gray-300 group-hover:text-white'}`}>
              Trackr
            </span>
          </button>

          {/* Evaluation Icon */}
          <button 
            title="Evaluation"
            onClick={() => navigate('/admin/evaluation')}
            // MOBILE FIX: w-10 h-10 perfect square.
            className={`flex items-center justify-center md:gap-2 w-10 h-10 md:w-auto md:px-4 md:h-10 rounded-lg md:rounded-xl transition-all duration-300 ease-out active:scale-95 group ${
              location.pathname === '/admin/evaluation'
              ? 'bg-[#FFCC00] shadow-md' 
              : 'hover:bg-white/10'
            }`}
          >
            <img 
              src="/evaluation.svg" 
              alt="Evaluation" 
              className={`w-5 h-5 transition-all duration-300 ${
                location.pathname === '/admin/evaluation' 
                ? 'brightness-0 opacity-90' 
                : 'brightness-0 invert opacity-70 group-hover:opacity-100'
              }`} 
            />
            {/* TEXT: Strictly hidden on mobile */}
            <span className={`hidden md:block text-[15px] font-bold font-['Inter'] whitespace-nowrap ${location.pathname === '/admin/evaluation' ? 'text-[#001A33]' : 'text-gray-300 group-hover:text-white'}`}>
              Evaluation
            </span>
          </button>

        </div>

        {/* ==============================
            3. LOGOUT (Right)
        ============================== */}
        <div className="flex items-center shrink-0">
          
          {/* Admin Name: Strictly hidden on mobile */}
          {adminName && (
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-white text-[15px] font-bold font-['Inter']">
                {adminName}
              </span>
              <span className="text-[#FFCC00] text-[12px] font-bold font-['Inter'] tracking-wider uppercase">
                Admin
              </span>
            </div>
          )}

          {/* Logout Icon */}
          <button 
            title="Logout"
            onClick={handleLogout}
            // MOBILE FIX: w-10 h-10 perfect square.
            className="flex items-center justify-center md:gap-2 w-10 h-10 md:w-auto md:px-4 md:h-10 bg-[#004080] text-white rounded-lg md:rounded-xl hover:bg-red-900 transition-all duration-300 ease-out active:scale-95 group shadow-md border border-white/10"
          >
            <img 
              src="/logout.svg" 
              alt="Logout" 
              className="w-5 h-5 shrink-0 brightness-0 invert group-hover:brightness-200 transition-all" 
            />
            {/* TEXT: Strictly hidden on mobile */}
            <span className="hidden md:block group-hover:text-white text-[15px] font-normal font-['Croissant_One'] whitespace-nowrap">
              Logout
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default AdminDashboardHeaderSection;