import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout'; 

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate sending the reset email
    console.log("Reset link sent to:", email);
    alert(`A password reset link has been sent to ${email}`);
    navigate('/'); // Send them back to login after success
  };

  return (
    <AuthLayout>
      
      {/* Back Button */}
      <button 
        type="button"
        onClick={() => navigate('/')} 
        className="absolute top-6 left-6 lg:top-12 lg:left-12 text-[#003366] hover:opacity-70 transition-opacity"
        aria-label="Back to Login"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:h-8 lg:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* CLONED WIDTH: Changed to 440px to perfectly match Sign Up */}
      <div className="w-full max-w-[440px]">
        
        {/* Adjusted margins and text sizes to sync perfectly with the other pages */}
        <div className="mb-6">
          <h2 className="text-[32px] lg:text-[38px] font-bold text-[#003366] leading-tight mb-1 font-['Calistoga'] tracking-tight">
            Forgot Password
          </h2>
          <p className="text-[#003366] font-bold text-sm lg:text-base font-['Calistoga']">
            Enter the email address of your account
          </p>
        </div>

        {/* Space-y-3 to match the Sign Up form gap */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          <div>
            {/* Added the visible label to match the Login/Sign Up design */}
            <label className="block text-black font-extrabold mb-1 font-['Calistoga'] text-sm lg:text-base tracking-wide">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              spellCheck="false"
              autoComplete="email"
              className="w-full h-[44px] px-5 bg-[#E9EBEF] rounded-2xl outline-none focus:ring-2 focus:ring-[#003366] font-['Fjord'] text-sm lg:text-base border border-transparent transition-all"
            />
          </div>

          {/* CLONED BUTTON: Matches the rounded-2xl, height, and hover effects */}
          <button
            type="submit"
            className="w-full h-[48px] bg-[#003366] text-white text-[16px] lg:text-[18px] font-bold rounded-2xl mt-5 hover:bg-[#002244] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-['Calistoga'] tracking-wider shadow-md uppercase"
          >
            Reset Password
          </button>
          
        </form>
        
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;