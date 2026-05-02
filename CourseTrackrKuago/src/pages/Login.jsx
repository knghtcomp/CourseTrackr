import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';

export const LogInPageStudent = () => {
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  // THE FIX: Restrict input to numbers only and a max of 10 characters
  const handleIdChange = (e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, ''); // Strips all non-number characters
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

    // THE SECRET DOOR: Hardcoded Admin Login (Bypasses the 10-digit rule!)
    if (idNumber === "00002026" && password === "CPEadmin") {
      localStorage.setItem('currentUser', JSON.stringify({
        id: "master-admin",
        role: "admin",
        firstName: "System",
        lastName: "Admin"
      }));
      navigate('/admin');
      return; 
    }

    // THE FIX: Enforce exactly 10 digits for regular students
    if (idNumber.length !== 10) {
      alert("Your Student ID Number must be exactly 10 digits.");
      return;
    }

    // Standard Student Login Logic
    try {
      const response = await fetch('http://localhost:5000/api/login', {
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
        localStorage.setItem('currentUser', JSON.stringify(data.user));
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
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
              >
                <img src="/privacy.svg" alt="Toggle Password" className="w-5 h-5" />
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

        <div className="text-center mt-6">
        <p className="text-[12px] text-gray-500 font-medium">
        Need help? Contact <a href="mailto:lim.joshelly@gmail.com" className="text-[#003366] hover:underline font-bold">admin@cpe.com</a>
        </p>
        </div>
        
      </div>
    </AuthLayout>
  );
};

export default LogInPageStudent;