import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';

export const ResetPassword = () => {
  const { token } = useParams(); // Grabs the token right out of the URL!
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Password successfully reset! You can now log in.");
        navigate('/'); // Send them back to the login page
      } else {
        alert(data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Could not connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[440px]">
        <div className="mb-6">
          <h2 className="text-[32px] lg:text-[38px] font-bold text-[#003366] leading-tight mb-1 font-['Calistoga'] tracking-tight">
            Create New Password
          </h2>
          <p className="text-[#003366] font-bold text-sm lg:text-base font-['Calistoga']">
            Please enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-black font-extrabold mb-1 font-['Calistoga'] text-sm lg:text-base tracking-wide">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[44px] px-5 pr-12 bg-[#E9EBEF] rounded-full outline-none focus:ring-2 focus:ring-[#003366] font-['Fjord'] text-sm lg:text-base transition-all"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#003366] transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-black font-extrabold mb-1 font-['Calistoga'] text-sm lg:text-base tracking-wide">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-[44px] px-5 pr-12 bg-[#E9EBEF] rounded-full outline-none focus:ring-2 focus:ring-[#003366] font-['Fjord'] text-sm lg:text-base transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[48px] bg-[#003366] text-white text-[16px] lg:text-[18px] font-bold rounded-full mt-5 hover:bg-[#002244] hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 transition-all duration-200 font-['Calistoga'] tracking-wider shadow-md uppercase"
          >
            {isLoading ? "Saving..." : "Reset Password"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;