import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';

export const LogInPageStudent = () => {
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleIdChange = (e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, ''); 
    if (onlyNumbers.length <= 10) {
      setIdNumber(onlyNumbers);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!idNumber || !password) {
      alert("Please enter both your ID Number and Password.");
      return;
    }

    // THE FIX: Save Admin to its own specific memory key ('adminUser')
    if (idNumber === "00002026" && password === "CPEadmin") {
      localStorage.setItem('adminUser', JSON.stringify({
        id: "master-admin",
        role: "admin",
        firstName: "System",
        lastName: "Admin"
      }));
      navigate('/admin');
      return; 
    }

    if (idNumber.length !== 10) {
      alert("Your Student ID Number must be exactly 10 digits.");
      return;
    }

    // Standard Student Login Logic
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idNumber: idNumber,
          password: password,
          role: 'student' 
        })
      });

      const data = await response.json();

      if (response.ok) {
        // THE FIX: Save regular student to a separate memory key ('studentUser')
        localStorage.setItem('studentUser', JSON.stringify(data.user));
        navigate('/dashboard'); 
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Could not connect to the server. Please ensure the backend is running.");
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[440px]"> 
        
        <div className="mb-6"> 
          <h2 className="text-[32px] lg:text-[38px] font-bold text-[#003366] leading-tight mb-1 font-['Calistoga'] tracking-tight">
            Welcome Back, Kuago
          </h2>
          <p className="text-[#003366] font-bold text-sm lg:text-base font-['Calistoga']">Sign in to your account</p>
        </div>

        <form className="space-y-3" onSubmit={handleSignIn}> 
          
          <div>
            <label className="block text-black font-extrabold mb-1 font-['Calistoga'] text-sm lg:text-base tracking-wide">
              ID Number
            </label>
            <input
              type="text"
              value={idNumber}
              onChange={handleIdChange}
              placeholder="e.g. 2023101234"
              className="w-full h-[44px] px-5 bg-[#E9EBEF] rounded-full outline-none focus:ring-2 focus:ring-[#003366] font-['Fjord'] text-sm lg:text-base border border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-black font-extrabold mb-1 font-['Calistoga'] text-sm lg:text-base tracking-wide">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[44px] px-5 pr-12 bg-[#E9EBEF] rounded-full outline-none focus:ring-2 focus:ring-[#003366] font-['Fjord'] text-sm lg:text-base border border-transparent transition-all"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#003366] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-[#003366]"
              />
              <span className="text-[13px] font-extrabold text-black font-['Calistoga'] tracking-wide group-hover:text-[#003366] transition-colors">Remember me</span>
            </label>
            <button 
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-[13px] font-extrabold text-[#003366] font-['Calistoga'] hover:underline tracking-wide bg-transparent border-none p-0 cursor-pointer"
            >
            Forgot Password?
            </button>
          </div>

          <button
            type="submit" 
            className="w-full h-[48px] bg-[#003366] text-white text-[16px] lg:text-[18px] font-bold rounded-full mt-3 hover:bg-[#002244] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-['Calistoga'] tracking-wider shadow-md"
          >
            SIGN IN
          </button>

          <div className="flex items-center gap-4 my-4 px-2">
            <div className="flex-1 border-t border-black/20"></div>
            <span className="text-[13px] font-extrabold text-black/50 font-['Calistoga'] tracking-wide uppercase">or</span>
            <div className="flex-1 border-t border-black/20"></div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/signup')} 
            className="w-full h-[48px] bg-[#E9EBEF] text-[#003366] text-[16px] lg:text-[18px] font-bold rounded-full hover:bg-[#D1D5DB] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-['Calistoga'] tracking-wider shadow-sm"
          >
            CREATE ACCOUNT
          </button>
        </form>

        {/* ✅ THE FIX: Grouped the "Need help?" text and the new links together safely at the bottom */}
        <div className="text-center mt-6 flex flex-col gap-2">
          <p className="text-[12px] text-gray-500 font-medium font-['Inter']">
            Need help? Contact <a href="mailto:lim.joshelly@gmail.com" className="text-[#003366] hover:underline font-bold">admin@cpe.com</a>
          </p>
          
          {/* MOBILE FIX: Added flex-wrap and gap-y-2 so if the screen is super narrow, it wraps gracefully instead of breaking the page. */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 md:gap-x-4 gap-y-1">
            <button 
              onClick={() => navigate('/about')}
              // MOBILE FIX: Scaled text down to 10px on phones, returns to 12px on desktop
              className="text-gray-500 hover:text-[#003366] text-[10px] md:text-[12px] font-semibold font-['Inter'] transition-colors"
            >
              About Us
            </button>
            
            <span className="text-gray-300 text-[10px] md:text-[12px]">|</span>
            
            <button 
              onClick={() => navigate('/privacy')}
              className="text-gray-500 hover:text-[#003366] text-[10px] md:text-[12px] font-semibold font-['Inter'] transition-colors"
            >
              Privacy Policy
            </button>
            
            <span className="text-gray-300 text-[10px] md:text-[12px]">|</span>
            
            <button
              onClick={() => navigate('/terms')}
              className="text-gray-500 hover:text-[#003366] text-[10px] md:text-[12px] font-semibold font-['Inter'] transition-colors"
            >
              {/* MOBILE FIX: Swapped "And" for "&" to save horizontal space on small screens */}
              Terms & Conditions
            </button>
          </div>
        </div>
        
      </div>
    </AuthLayout>
  );
};

export default LogInPageStudent;