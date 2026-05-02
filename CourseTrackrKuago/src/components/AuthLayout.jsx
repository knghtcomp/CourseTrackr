import React from 'react';

export const AuthLayout = ({ children }) => {
  return (
    <div className="flex w-full min-h-screen bg-white font-sans">
      
      {/* THE FIX: Removed 'sticky top-0 h-screen' so this panel scrolls naturally with the page */}
      <div
        className="hidden lg:flex w-1/2 relative bg-cover bg-top flex-col p-8 lg:p-12 xl:p-16"
        style={{ backgroundImage: `url('/IMG_20260305_1329041.png')` }}
      >
        <div className="absolute inset-0 bg-[#003366]/60"></div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex flex-row items-center mt-12 lg:mt-20 xl:mt-32 mb-6 lg:mb-8 -ml-6">
            <img src="/logo.svg" alt="Logo" className="w-20 h-20 lg:w-24 lg:h-24 -mr-2 drop-shadow-lg" />
            <div className="flex flex-col justify-center">
              <h1 className="text-[32px] lg:text-[36px] xl:text-[45px] font-bold text-white leading-none font-['Calistoga'] m-0">
                COURSETRACKR
              </h1>
              <h2 className="text-[18px] lg:text-[20px] xl:text-[25px] text-[#FFCC00] font-['Calistoga'] m-0 mt-0">
                Academic Management Tool
              </h2>
            </div>
          </div>

          <div className="mb-6 lg:mb-8">
            <h3 className="text-[24px] lg:text-[28px] xl:text-[32px] text-white leading-tight font-['Calistoga'] max-w-[550px]">
              University of Science and Technology of Southern Philippines
            </h3>
            <p className="text-[18px] lg:text-[20px] xl:text-[25px] text-white italic opacity-90 font-['Castoro'] mt-2">
              Computer Engineering Department
            </p>
          </div>

          {/* Because the Left Panel stretches to match the Right Panel, 'mt-auto' will cleanly push these bullets to the very bottom of the page */}
          {/* THE FIX: Replaced mt-auto with a fixed margin (mt-12 lg:mt-16 xl:mt-24) */}
          <div className="space-y-3 lg:space-y-4 mt-12 lg:mt-16 xl:mt-2 mb-16 lg:mb-20 xl:mb-32">
            <div className="flex items-center gap-4">
              <img src="/bullet.svg" alt="bullet" className="w-4 h-4" />
              <p className="text-[16px] lg:text-[18px] xl:text-[20px] text-white font-['Calistoga'] m-0">Track your academic progress</p>
            </div>
            <div className="flex items-center gap-4">
              <img src="/bullet.svg" alt="bullet" className="w-4 h-4" />
              <p className="text-[16px] lg:text-[18px] xl:text-[20px] text-white font-['Calistoga'] m-0">Get personalized course recommendations</p>
            </div>
            <div className="flex items-center gap-4">
              <img src="/bullet.svg" alt="bullet" className="w-4 h-4" />
              <p className="text-[16px] lg:text-[18px] xl:text-[20px] text-white font-['Calistoga'] m-0">Monitor prerequisite compliance</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      {/* RIGHT PANEL: Now anchored to the top (items-start) with identical top padding (pt-20 lg:pt-32) */}
      {/* THE FIX: Shrunk the top padding to pt-10 lg:pt-16 to pull both forms higher up the screen */}
      <div className="w-full lg:w-1/2 flex items-start justify-center p-6 lg:p-8 pt-10 lg:pt-16 xl:pt-20 relative min-h-screen">
      
        {children}
      </div>
     

    </div>
  );
};

export default AuthLayout;