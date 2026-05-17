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
      className="w-full h-[60px] md:h-[90px] flex items-center relative shadow-lg z-50 shrink-0"
      style={{ background: 'linear-gradient(to right, #001A33, #004080)' }}
    >
      <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between px-3 md:px-6 h-full gap-2">
        
        {/* ==============================
            LEFT SIDE: LOGO + NAVIGATION
        ============================== */}
        <div className="flex items-center gap-3 md:gap-8">
          
          {/* LOGO */}
          <div 
            className="flex items-center cursor-pointer shrink-0" 
            onClick={() => navigate('/admin')}
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

          {/* NAVIGATION ICONS */}
          <div className="flex items-center p-1 bg-black/20 rounded-xl md:rounded-2xl border border-white/10 backdrop-blur-sm">
            <button 
              title="Dashboard"
              onClick={() => navigate('/admin')}
              className={`flex items-center justify-center md:gap-2 w-8 h-8 md:w-auto md:px-4 md:h-10 rounded-lg md:rounded-xl transition-all duration-300 ease-out active:scale-95 group ${
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
              <span className={`hidden md:block text-[15px] font-bold font-['Inter'] whitespace-nowrap ${location.pathname === '/admin' || location.pathname === '/admin/dashboard' ? 'text-[#001A33]' : 'text-gray-300 group-hover:text-white'}`}>
                Student Management
              </span>
            </button>
          </div>

        </div>

        {/* ==============================
            RIGHT SIDE: LOGOUT
        ============================== */}
        <div className="flex items-center shrink-0">
          
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
              <span className="hidden md:block text-[15px] font-bold font-['Inter'] whitespace-nowrap text-gray-300 group-hover:text-white">
                Logout
              </span>
            </button>
          </div>
          
        </div>

      </div>
    </header>
  );
};

export default AdminDashboardHeaderSection;