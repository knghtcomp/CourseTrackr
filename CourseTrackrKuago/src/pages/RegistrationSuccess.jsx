import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout'; // <-- Import the wrapper!

const RegistrationSuccess = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      {/* CLONED WIDTH: Locked to exactly 480px to match all other pages */}
      {/* Removed the 'mt-10' so it aligns perfectly with the AuthLayout ceiling height */}
      <div className="w-full max-w-[480px] flex flex-col items-center text-center">
        
        {/* Adjusted text size to match the 'Welcome, Kuago' headings exactly */}
        <h2 className="text-[36px] lg:text-[42px] font-bold text-[#003366] leading-tight mb-12 font-['Calistoga'] tracking-tight">
          Registered Successfully
        </h2>
        
        {/* CLONED BUTTON: Set to h-[52px] to match Login and Sign Up buttons */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full h-[52px] bg-[#003366] text-white text-[18px] lg:text-[20px] font-bold rounded-full hover:bg-[#002244] transition-colors font-['Calistoga'] tracking-wider shadow-lg"
        >
          Go back to Log-In
        </button>
        
      </div>
    </AuthLayout>
  );
};

export default RegistrationSuccess;