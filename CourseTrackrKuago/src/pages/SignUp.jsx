import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { AuthLayout } from '../components/AuthLayout'; 

export const SignUpStudent = () => {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", idNumber: "",
    email: "", password: "", confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "idNumber") {
      const onlyNumbers = value.replace(/\D/g, '');
      if (onlyNumbers.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: onlyNumbers }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // THE FIX: Helper function to capitalize the first letter of every word
  const formatName = (name) => {
    if (!name) return "";
    return name
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    const isFormComplete = Object.values(formData).every(val => val.trim() !== "");
    if (!isFormComplete) {
      alert("Please fill out every single field before creating your account.");
      return;
    }

    if (formData.idNumber.length !== 10) {
      alert("Your ID Number must be exactly 10 digits long.");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // THE FIX: Apply the formatter before sending to the database!
          firstName: formatName(formData.firstName),
          lastName: formatName(formData.lastName),
          idNumber: formData.idNumber,
          email: formData.email,
          password: formData.password,
          role: 'student' 
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user) {
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        } else {
          localStorage.setItem('currentUser', JSON.stringify(data));
        }

        alert("Account created successfully!");
        navigate('/setup'); 
        
      } else {
        alert(data.message);
      }

    } catch (error) {
      console.error("FATAL ERROR during signup:", error);
      alert("Failed to connect to the server.");
    }
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

      <div className="w-full max-w-[440px]">
        
        <div className="mb-6">
          <h2 className="text-[32px] lg:text-[38px] font-bold text-[#003366] leading-tight mb-1 font-['Calistoga'] tracking-tight">
            Welcome to CourseTrackr
          </h2>
          <p className="text-[#003366] font-bold text-sm lg:text-base font-['Calistoga']">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-black font-extrabold mb-1 font-['Calistoga'] text-sm lg:text-base tracking-wide">First Name</label>
              <input
                type="text"
                name="firstName"
                required 
                placeholder='Juan'
                value={formData.firstName}
                onChange={handleChange}
                className="w-full h-[44px] px-5 bg-[#E9EBEF] rounded-full outline-none focus:ring-2 focus:ring-[#003366] font-['Fjord'] text-sm lg:text-base border border-transparent transition-all"
              />
            </div>

            <div className="flex-1">
              <label className="block text-black font-extrabold mb-1 font-['Calistoga'] text-sm lg:text-base tracking-wide">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                placeholder='Dela Cruz, Jr.'
                value={formData.lastName}
                onChange={handleChange}
                className="w-full h-[44px] px-5 bg-[#E9EBEF] rounded-full outline-none focus:ring-2 focus:ring-[#003366] font-['Fjord'] text-sm lg:text-base border border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-black font-extrabold mb-1 font-['Calistoga'] text-sm lg:text-base tracking-wide">
              ID Number
            </label>
            <input
              type="text"
              name="idNumber"
              required
              placeholder="2026123456"
              value={formData.idNumber}
              onChange={handleChange}
              className="w-full h-[44px] px-5 bg-[#E9EBEF] rounded-full outline-none focus:ring-2 focus:ring-[#003366] font-['Fjord'] text-sm lg:text-base border border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-black font-extrabold mb-1 font-['Calistoga'] text-sm lg:text-base tracking-wide">Email</label>
            <input
              type="email"
              name="email"
              placeholder="juandelacruz@gmail.com"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full h-[44px] px-5 bg-[#E9EBEF] rounded-full outline-none focus:ring-2 focus:ring-[#003366] font-['Fjord'] text-sm lg:text-base border border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-black font-extrabold mb-1 font-['Calistoga'] text-sm lg:text-base tracking-wide">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                spellCheck="false"
                autoComplete="off"
                className="w-full h-[44px] px-5 pr-12 bg-[#E9EBEF] rounded-full border-none outline-none focus:outline-none focus:ring-2 focus:ring-[#003366] font-['Fjord'] text-sm lg:text-base transition-all"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
              >
                <img src="/privacy.svg" alt="Toggle" className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-black font-extrabold mb-1 font-['Calistoga'] text-sm lg:text-base tracking-wide">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                spellCheck="false"
                autoComplete="off"
                className="w-full h-[44px] px-5 pr-12 bg-[#E9EBEF] rounded-full border-none outline-none focus:outline-none focus:ring-2 focus:ring-[#003366] font-['Fjord'] text-sm lg:text-base transition-all"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
              >
                <img src="/privacy.svg" alt="Toggle" className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full h-[48px] bg-[#003366] text-white text-[16px] lg:text-[18px] font-bold rounded-full mt-5 hover:bg-[#002244] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-['Calistoga'] tracking-wider shadow-md"
          >
            CREATE ACCOUNT
          </button>
        </form>
        
      </div>
    </AuthLayout>
  );
};

export default SignUpStudent;